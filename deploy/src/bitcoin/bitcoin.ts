import { Construct } from "constructs";
import { readFileSync, writeFileSync } from "fs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as s3a from "aws-cdk-lib/aws-s3-assets";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as log from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { buildSync } from "esbuild";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { compile } = handlebars;

type Network = "testnet";

export class BitcoinStorage extends Construct {
  readonly blockchainDataBucket: s3.IBucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.blockchainDataBucket = new s3.Bucket(this, "DataBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}

interface BitcoinExeStorageProps {
  localArchivePath: string;
}

export class BitcoinExeStorage extends Construct {
  readonly bitcoinExeAsset: s3a.Asset;
  constructor(
    scope: Construct,
    id: string,
    { localArchivePath }: BitcoinExeStorageProps,
  ) {
    super(scope, id);

    this.bitcoinExeAsset = new s3a.Asset(this, "BitcoinExeAsset", {
      path: localArchivePath,
    });
  }
}

interface NodeExeStorageProps {
  localArchivePath: string;
}

export class NodeExeStorage extends Construct {
  readonly nodeExeAsset: s3a.Asset;
  constructor(
    scope: Construct,
    id: string,
    { localArchivePath }: NodeExeStorageProps,
  ) {
    super(scope, id);

    this.nodeExeAsset = new s3a.Asset(this, "BitcoinExeAsset", {
      path: localArchivePath,
    });
  }
}

interface BitcoinProps {
  network: Network;
  blockchainDataBucket: s3.IBucket;
  bitcoinExeAsset: s3a.Asset;
  nodeExeAsset: s3a.Asset;
}

function createPrivateVpc(scope: Construct, network: Network) {
  // Define a VPC (required for ALB and EC2 instances)
  const vpc = new ec2.Vpc(scope, `BitcoinVPC-${network}`, {
    maxAzs: 2, // Default is all AZs in the region,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: "asterisk",
        subnetType: ec2.SubnetType.PUBLIC,
      },
    ],
  });

  const securityGroup = new ec2.SecurityGroup(
    scope,
    `SecurityGroup-${network}`,
    {
      vpc,
      description: "Btc security group.",
      allowAllOutbound: true,
    },
  );

  if (network === "testnet") {
    // Expose p2p port 18333
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(18333),
      "allow p2p",
    );
  }
  return { vpc, securityGroup };
}

function createLifecycleLambda(
  ctx: Construct,
  documentName: string,
  role: iam.IRole,
) {
  const outFile = path.join(__dirname, "../../dist/lifecycle-lambda/index.js");
  buildSync({
    entryPoints: [
      path.join(
        __dirname,
        "../../../apps/functions/src/lambdas/asg-lifecycle-create.ts",
      ),
    ],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: outFile,
  });
  return new lambda.Function(ctx, "LifecycleLambda", {
    code: lambda.Code.fromAsset(path.dirname(outFile)),
    handler: "index.handler",
    runtime: lambda.Runtime.NODEJS_18_X,
    timeout: cdk.Duration.seconds(730),

    environment: {
      LAMBDA_ASG_LIFECYCLE_DOCUMENT: documentName,
      LAMBDA_ASG_LIFECYCLE_TIMEOUT: "710",
    },
    role,
  });
}

function createUserData({
  bitcoinExeAsset,
  blockchainDataBucket,
  cloudwatchConfiguration,
  network,
  nodeExeAsset,
}: {
  bitcoinExeAsset: s3a.Asset;
  blockchainDataBucket: s3.IBucket;
  cloudwatchConfiguration: s3a.Asset;
  network: Network;
  nodeExeAsset: s3a.Asset;
}) {
  const userData = ec2.UserData.forLinux();
  const nodeArchivePath = userData.addS3DownloadCommand({
    bucket: nodeExeAsset.bucket,
    bucketKey: nodeExeAsset.s3ObjectKey,
  });
  const confTemplate = compile<{ rpcallowip: string }>(
    readFileSync(
      path.join(
        __dirname,
        "../../bitcoin/",
        network === "testnet" ? "testnet" : "mainnet",
        "bitcoin.conf",
      ),
      "utf8",
    ),
  );
  // Setting as the vpc_cidr block doesn't work because that ALB is not in the VPC
  const conf = confTemplate({ rpcallowip: "0.0.0.0/0" });
  userData.addCommands(
    `runuser -l  ec2-user -c 'mkdir -p /home/ec2-user/.bitcoin; echo "${conf}" > /home/ec2-user/.bitcoin/bitcoin.conf'`,
  );
  const bitcoindArchive = userData.addS3DownloadCommand({
    bucket: bitcoinExeAsset.bucket,
    bucketKey: bitcoinExeAsset.s3ObjectKey,
  });

  const template = compile<{
    bitcoin_archive: string;
    data_dir_s3: string;
    data_dir: string;
    blockchain_data: string;
    node_archive: string;
  }>(
    readFileSync(path.join(__dirname, "../../bitcoin/config.sh.tmpl"), "utf8"),
  );

  const setupScript = template({
    bitcoin_archive: bitcoindArchive,
    data_dir_s3: cdk.Fn.join("", [
      "s3://",
      cdk.Fn.join("/", [
        blockchainDataBucket.bucketName,
        network === "testnet" ? "testnet.tar.gz" : "mainnet.tar.gz",
      ]),
    ]),
    data_dir: `/home/ec2-user/.bitcoin${
      network === "testnet" ? "/testnet3" : ""
    }`,
    blockchain_data: "/home/ec2-user/.bitcoin",
    node_archive: nodeArchivePath,
  });
  userData.addCommands(setupScript);

  userData.addS3DownloadCommand({
    bucket: cloudwatchConfiguration.bucket,
    bucketKey: cloudwatchConfiguration.s3ObjectKey,
    localFile: "/opt/amazon-cloudwatch-agent.json",
  });
  return userData;
}

function createLaunchTemplate({
  context,
  userData,
  role,
  securityGroup,
  spotOptions,
}: {
  context: Construct;
  userData: ec2.UserData;
  role: iam.IRole;
  securityGroup: ec2.ISecurityGroup;
  spotOptions?: cdk.aws_ec2.LaunchTemplateSpotOptions;
}) {
  return new ec2.LaunchTemplate(context, "LaunchTemplate", {
    userData,
    role,
    machineImage: ec2.MachineImage.latestAmazonLinux2023({
      cpuType: ec2.AmazonLinuxCpuType.ARM_64,
    }),
    blockDevices: [
      {
        deviceName: "/dev/xvda",
        volume: ec2.BlockDeviceVolume.ebs(60, {
          volumeType: ec2.EbsDeviceVolumeType.GP3,
        }),
      },
    ],
    spotOptions,
    securityGroup,
    associatePublicIpAddress: true,
  });
}

export class Bitcoin extends Construct {
  constructor(
    scope: Construct,
    id: string,
    {
      network,
      blockchainDataBucket,
      bitcoinExeAsset,
      nodeExeAsset,
    }: BitcoinProps,
  ) {
    super(scope, id);
    const commandName = `bitcoin-health-check-${network}`;
    new cdk.aws_ssm.CfnDocument(this, "Healthcheck", {
      content: {
        schemaVersion: "2.2",
        description: "Check health of bitcoind service in testnet mode",
        mainSteps: [
          {
            action: "aws:runShellScript",
            name: "CheckBitcoindTestnet",
            inputs: {
              timeoutSeconds: "30",
              runCommand: [
                "#!/bin/bash",
                `runuser -l  ec2-user -c '/usr/local/bin/bitcoin-cli ${
                  network === "testnet" ? "-testnet " : ""
                }-datadir=/home/ec2-user/.bitcoin getblockchaininfo'`,
              ],
            },
          },
        ],
      },
      name: commandName,
      documentFormat: "JSON",
      documentType: "Command",
    });
    new cdk.aws_ssm.CfnDocument(this, "Session", {
      content: {
        schemaVersion: "1.0",
        description: `Bitcoin ${network}`,
        sessionType: "Standard_Stream",
        inputs: {
          runAsEnabled: true,
          runAsDefaultUser: "ec2-user",
          idleSessionTimeout: "20",
          shellProfile: {
            linux: "cd ~ && bash",
          },
        },
      },
      name: `bitcoin-${network}`,
      documentFormat: "JSON",
      documentType: "Session",
    });

    const role = new iam.Role(this, `ec2Role-${network}`, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonSSMManagedInstanceCore",
      ),
    );
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
    );

    const { vpc, securityGroup } = createPrivateVpc(this, network);

    // Create an Application Load Balancer
    const albSecurityGroup = new ec2.SecurityGroup(
      this,
      `BitcoinALBSecurityGroup-${network}`,
      {
        vpc,
        description: "Bitcoin ALB security group.",
      },
    );
    const alb = new elbv2.ApplicationLoadBalancer(
      this,
      `BitcoinALB-${network}`,
      {
        vpc,
        internetFacing: true,
      },
    );
    alb.addSecurityGroup(albSecurityGroup);

    // Allow inbound access to port 18332 but only from the VPC\
    // Seems to get added automatically
    // securityGroup.addIngressRule(
    //   ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
    //   network === "testnet" ? ec2.Port.tcp(18332) : ec2.Port.tcp(8332),
    //   "allow rpc",
    // );
    // health check
    securityGroup.addIngressRule(
      ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
      ec2.Port.tcp(8080),
      "allow health check",
    );

    blockchainDataBucket.grantRead(role);

    bitcoinExeAsset.grantRead(role);
    const cloudwatchConfiguration = new s3a.Asset(
      this,
      "CloudWatchConfiguration",
      {
        path: path.join(
          __dirname,
          "../../bitcoin",
          network,
          "cloudwatch.config.json",
        ),
      },
    );
    cloudwatchConfiguration.grantRead(role);

    const userData = createUserData({
      bitcoinExeAsset,
      blockchainDataBucket,
      cloudwatchConfiguration,
      network,
      nodeExeAsset,
    });

    // Add a listener to the ALB
    const listener = alb.addListener(`Listener-${network}`, {
      port: network === "testnet" ? 18332 : 8332,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
    });

    // Define an EC2 Auto Scaling Group with Spot Instances
    const asg = new autoscaling.AutoScalingGroup(this, "Asg", {
      vpc,
      healthCheck: autoscaling.HealthCheck.ec2({
        grace: cdk.Duration.seconds(360),
      }),
      mixedInstancesPolicy: {
        launchTemplate: createLaunchTemplate({
          context: this,
          userData,
          role,
          securityGroup,
        }),
        instancesDistribution: {
          onDemandPercentageAboveBaseCapacity: 0,
          onDemandAllocationStrategy:
            autoscaling.OnDemandAllocationStrategy.LOWEST_PRICE,
          spotAllocationStrategy:
            autoscaling.SpotAllocationStrategy.PRICE_CAPACITY_OPTIMIZED,
          spotMaxPrice: "0.1",
        },
        launchTemplateOverrides: [
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.M7G,
              ec2.InstanceSize.LARGE,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.M6G,
              ec2.InstanceSize.LARGE,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.LARGE,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.M7G,
              ec2.InstanceSize.MEDIUM,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.M6G,
              ec2.InstanceSize.MEDIUM,
            ),
          },
          {
            instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T4G,
              ec2.InstanceSize.MEDIUM,
            ),
          },
        ],
      },
      minCapacity: 2,
    });

    const hookFunctionRole = new iam.Role(this, "HookFunctionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        lambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["autoscaling:CompleteLifecycleAction"],
              resources: [asg.autoScalingGroupArn],
            }),
            new iam.PolicyStatement({
              actions: ["ssm:SendCommand", "ssm:GetCommandInvocation"],
              resources: [
                `arn:aws:ec2:${cdk.Stack.of(this).region}:${
                  cdk.Stack.of(this).account
                }:instance/*`,
              ],
            }),
          ],
        }),
      },
    });
    hookFunctionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );
    // I would rather not do this but I can't figure out how else
    // This role would let the lambda do anything to any instance
    // but since the lambda is running well known commands I think
    // it's ok
    hookFunctionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMFullAccess"),
    );
    const asgNotificationLambda = createLifecycleLambda(
      this,
      commandName,
      hookFunctionRole,
    );

    asg.addLifecycleHook("LifecycleHookCreate", {
      lifecycleTransition: autoscaling.LifecycleTransition.INSTANCE_LAUNCHING,
      notificationTarget: new cdk.aws_autoscaling_hooktargets.FunctionHook(
        asgNotificationLambda,
      ),
      defaultResult: autoscaling.DefaultResult.ABANDON,
      heartbeatTimeout: cdk.Duration.seconds(720),
    });

    const healthCheckScript = new s3a.Asset(this, "HealthCheckScript", {
      path: path.join(__dirname, "../../bitcoin", network, "healthcheck.mjs"),
    });
    const healthCheckScriptPath = userData.addS3DownloadCommand({
      bucket: healthCheckScript.bucket,
      bucketKey: healthCheckScript.s3ObjectKey,
    });
    healthCheckScript.grantRead(role);

    asg.addUserData(
      `/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/amazon-cloudwatch-agent.json`,
    );
    if (network === "testnet") {
      asg.addUserData(
        `runuser -l  ec2-user -c 'node ${healthCheckScriptPath} & bitcoind -testnet -datadir=/home/ec2-user/.bitcoin 2>> /home/ec2-user/bitcoin.stderr.log 1>> /home/ec2-user/bitcoin.stdout.log'`,
      );
    }

    // Attach the ASG to the ALB
    listener.addTargets(`BitcoinTarget-${network}`, {
      port: network === "testnet" ? 18332 : 8332,
      targets: [asg],
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        enabled: true,
        port: "8080",
        healthyHttpCodes: "200",
        unhealthyThresholdCount: 2,
        timeout: cdk.Duration.seconds(15),
        healthyThresholdCount: 3,
      },
    });

    new log.LogGroup(this, "stdout", {
      retention: log.RetentionDays.TWO_WEEKS,
      logGroupName: `bitcoin-${network}-stdout-log`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new log.LogGroup(this, "stderr", {
      retention: log.RetentionDays.TWO_WEEKS,
      logGroupName: `bitcoin-${network}-stderr-log`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
