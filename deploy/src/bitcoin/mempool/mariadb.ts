import { Construct } from "constructs";
import { readFileSync, writeFileSync } from "fs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as asm from "aws-cdk-lib/aws-secretsmanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as s3a from "aws-cdk-lib/aws-s3-assets";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as log from "aws-cdk-lib/aws-logs";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { compile } = handlebars;

type Network = "testnet";

function createCloudWatchConfiguration({
  appName,
  userName,
}: {
  appName: string;
  userName: string;
}) {
  const confTemplate = compile<{ appName: string; userName: string }>(
    JSON.stringify({
      agent: {
        run_as_user: "root",
      },
      logs: {
        logs_collected: {
          files: {
            collect_list: [
              {
                file_path: "/home/{{userName}}/{{appName}}.stderr.log",
                log_group_name: "__stderr__",
                log_stream_name: "{instance_id}",
              },
              {
                file_path: "/home/{{userName}}/{{appName}}.stdout.log",
                log_group_name: "__stdout__",
                log_stream_name: "{instance_id}",
              },
            ],
          },
        },
      },
    }),
  );
  return confTemplate({ appName, userName });
}

class MariaDbLaunchTemplate extends Construct {
  readonly launchTemplate: ec2.LaunchTemplate;
  readonly role: iam.IRole;
  readonly securityGroup: ec2.ISecurityGroup;
  constructor(
    scope: Construct,
    id: string,
    {
      dataBlockDevice,
      dbRole,
      initialLoad,
      stdErrLog,
      stdOutLog,
      vpc,
    }: {
      dataBlockDevice: ec2.BlockDevice;
      dbRole: "primary" | "replica";
      initialLoad?: boolean;
      vpc: ec2.IVpc;
      stdOutLog: log.ILogGroup;
      stdErrLog: log.ILogGroup;
    },
  ) {
    super(scope, id);

    const tmp = cdk.FileSystem.tmpdir;
    const cloudWatchConfig = createCloudWatchConfiguration({
      appName: "mariadb",
      userName: "mysql",
    });
    const cloudwatchConfigPath = `${tmp}/${id}`;
    writeFileSync(cloudwatchConfigPath, cloudWatchConfig, "utf8");
    const cloudwatchConfiguration = new s3a.Asset(
      scope,
      `${id}CloudWatchConfiguration`,
      {
        path: cloudwatchConfigPath,
      },
    );

    const rootPasswordSecret = new asm.Secret(scope, `${id}PasswordSecret`, {
      description: "Root password for the MariaDB database.",
    });

    const userData = ec2.UserData.forLinux();
    userData.addS3DownloadCommand({
      bucket: cloudwatchConfiguration.bucket,
      bucketKey: cloudwatchConfiguration.s3ObjectKey,
      localFile: "/opt/amazon-cloudwatch-agent.json",
    });
    const mariadbConfig = (() => {
      switch (dbRole) {
        case "primary":
          return this.addPrimaryConfig();
        case "replica":
          return this.addReplicaConfig();
        default:
          throw new Error(`Unknown dbRole: ${dbRole}`);
      }
    })();
    userData.addS3DownloadCommand({
      bucket: mariadbConfig.bucket,
      bucketKey: mariadbConfig.s3ObjectKey,
      localFile: "/etc/mysql/conf.d/00-init.cnf",
    });

    const mariaDbRepoAsset = new s3a.Asset(this, `${id}RepoAsset`, {
      path: path.join(__dirname, "../../../mempool/MariaDB.repo"),
    });
    userData.addS3DownloadCommand({
      bucket: mariaDbRepoAsset.bucket,
      bucketKey: mariaDbRepoAsset.s3ObjectKey,
      localFile: "/etc/yum.repos.d/MariaDB.repo",
    });

    userData.addCommands(
      ...[
        `sudo sed -i 's/__stderr__/${stdErrLog.logGroupName}/' /opt/amazon-cloudwatch-agent.json`,
        `sudo sed -i 's/__stdout__/${stdOutLog.logGroupName}/' /opt/amazon-cloudwatch-agent.json`,
        "rpm --import https://supplychain.mariadb.com/MariaDB-Server-GPG-KEY",
        "for i in {1..10}; do yum update -y && break || sleep 15; done",
        "for i in {1..10}; do yum install -y MariaDB-server MariaDB-client amazon-cloudwatch-agent && break || sleep 15; done",
        ...(initialLoad ? ["mkfs -t xfs /dev/xvdb || true"] : []),
        "mkdir -p /mnt/mariadb-data",
        "mount /dev/xvdb /mnt/mariadb-data",
        "mkdir -p /home/mysql",
        "chown -R mysql /home/mysql",
        "chown -R mysql /mnt/mariadb-data",
        "systemctl enable mariadb.service",
        "systemctl start mariadb.service",
        `/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/amazon-cloudwatch-agent.json`,
        `mariadb-admin -u root password $(aws secretsmanager get-secret-value --secret-id ${rootPasswordSecret.secretFullArn} --query SecretString --output text)`,
      ],
    );

    this.role = new iam.Role(scope, `${id}Ec2Role`, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonSSMManagedInstanceCore",
      ),
    );
    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
    );

    rootPasswordSecret.grantRead(this.role);
    cloudwatchConfiguration.grantRead(this.role);
    mariaDbRepoAsset.grantRead(this.role);

    this.securityGroup = new ec2.SecurityGroup(scope, `${id}SecurityGroup`, {
      vpc,
      description: "MariaDB security group.",
    });

    this.launchTemplate = new ec2.LaunchTemplate(this, `${id}LaunchTemplate`, {
      userData,
      role: this.role,
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(10, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
          }),
        },
        ...(dataBlockDevice ? [dataBlockDevice] : []),
      ],
      securityGroup: this.securityGroup,
      associatePublicIpAddress: true,
    });
  }

  addReplicaConfig() {
    const tmp = cdk.FileSystem.tmpdir;
    const replicaConfig = compile<{ id: string }>(
      readFileSync(
        path.join(__dirname, "../../../mempool", "mariadb.replica.cnf"),
        "utf8",
      ),
    );
    const replicaConfigStr = replicaConfig({ id: "2" });
    const replicaConfigPath = `${tmp}/replica.cnf`;
    writeFileSync(replicaConfigPath, replicaConfigStr, "utf8");
    return new s3a.Asset(this, "ReplicaConfig", {
      path: replicaConfigPath,
    });
  }

  addPrimaryConfig() {
    const tmp = cdk.FileSystem.tmpdir;
    const primaryConfig = compile<{ id: string }>(
      readFileSync(
        path.join(__dirname, "../../../mempool", "mariadb.primary.cnf"),
        "utf8",
      ),
    );
    const primaryConfigStr = primaryConfig({ id: "1" });
    const primaryConfigPath = `${tmp}/primary.cnf`;
    writeFileSync(primaryConfigPath, primaryConfigStr, "utf8");
    return new s3a.Asset(this, "primaryConfig", {
      path: primaryConfigPath,
    });
  }
}

interface MariaDBProps {
  bitcoinVpc: ec2.IVpc;
  initialLoad?: boolean;
}
export class MariaDB extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { bitcoinVpc: vpc, initialLoad }: MariaDBProps,
  ) {
    super(scope, id);

    const stdOutLogPrimary = new log.LogGroup(this, `${id}PrimaryStdOut`, {
      retention: log.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const stdErrLogPrimary = new log.LogGroup(this, `${id}PrimaryStdErr`, {
      retention: log.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stdOutLogReplica = new log.LogGroup(this, `${id}ReplicaStdOut`, {
      retention: log.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const stdErrLogReplica = new log.LogGroup(this, `${id}ReplicaStdErr`, {
      retention: log.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const primaryBlockDevice: ec2.BlockDevice = {
      deviceName: "/dev/xvdb",
      volume: ec2.BlockDeviceVolume.ebs(40, {
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      }),
    };

    const replicaBlockDevice: ec2.BlockDevice = {
      deviceName: "/dev/xvdb",
      volume: ec2.BlockDeviceVolume.ebs(20, {
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      }),
    };

    const primaryMariaDb = new MariaDbLaunchTemplate(this, `${id}Primary`, {
      vpc,
      dataBlockDevice: primaryBlockDevice,
      dbRole: "primary",
      initialLoad,
      stdErrLog: stdErrLogPrimary,
      stdOutLog: stdOutLogPrimary,
    });

    const replicaMariaDb = new MariaDbLaunchTemplate(this, `${id}Replica`, {
      vpc,
      dataBlockDevice: replicaBlockDevice,
      dbRole: "replica",
      initialLoad,
      stdErrLog: stdErrLogReplica,
      stdOutLog: stdOutLogReplica,
    });

    // Allow the primary to connect to the replica
    primaryMariaDb.securityGroup.addIngressRule(
      ec2.Peer.securityGroupId(
        replicaMariaDb.securityGroup.connections.securityGroups[0]
          .securityGroupId,
      ),
      ec2.Port.tcp(3306),
      "replica",
    );
    replicaMariaDb.securityGroup.addEgressRule(
      ec2.Peer.securityGroupId(
        primaryMariaDb.securityGroup.connections.securityGroups[0]
          .securityGroupId,
      ),
      ec2.Port.tcp(3306),
      "primary",
    );

    const primaryAsg = new autoscaling.AutoScalingGroup(this, `primaryAsg`, {
      vpc,
      mixedInstancesPolicy: {
        launchTemplate: primaryMariaDb.launchTemplate,
        instancesDistribution: {
          onDemandPercentageAboveBaseCapacity: 100,
          onDemandAllocationStrategy:
            autoscaling.OnDemandAllocationStrategy.PRIORITIZED,
        },
        launchTemplateOverrides: [
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.MICRO,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.SMALL,
            ),
          },
        ],
      },
      minCapacity: 1,
    });

    const replicaAsg = new autoscaling.AutoScalingGroup(this, `ReplicaAsg`, {
      vpc,
      mixedInstancesPolicy: {
        launchTemplate: replicaMariaDb.launchTemplate,
        instancesDistribution: {
          onDemandPercentageAboveBaseCapacity: 20,
          onDemandAllocationStrategy:
            autoscaling.OnDemandAllocationStrategy.PRIORITIZED,
          spotAllocationStrategy:
            autoscaling.SpotAllocationStrategy.CAPACITY_OPTIMIZED_PRIORITIZED,
          spotMaxPrice: "0.1",
        },
        launchTemplateOverrides: [
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.MICRO,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.SMALL,
            ),
          },
        ],
      },
      minCapacity: 1,
    });

    new cdk.CfnOutput(this, `${id}PrimaryAsgArn`, {
      value: primaryAsg.autoScalingGroupArn,
    });
    new cdk.CfnOutput(this, `${id}ReplicaAsgArn`, {
      value: replicaAsg.autoScalingGroupArn,
    });
  }
}
