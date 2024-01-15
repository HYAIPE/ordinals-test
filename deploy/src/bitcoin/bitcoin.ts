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

interface BitcoinProps {
  network: Network;
  blockchainDataBucket: s3.IBucket;
  bitcoinExeAsset: s3a.Asset;
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

    // Allow inbound access to port 18332 but only from the VPC
    securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(18332),
      "allow rpc",
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
  const code = buildSync({
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

export class Bitcoin extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { network, blockchainDataBucket, bitcoinExeAsset }: BitcoinProps,
  ) {
    super(scope, id);
    const commandName = `bitcoin-health-check-${network}-2`;
    const healthCheckCommandDocument = new cdk.aws_ssm.CfnDocument(
      this,
      "Healthcheck",
      {
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
                  }getblockchaininfo'`,
                ],
              },
            },
          ],
        },
        name: commandName,
        documentFormat: "JSON",
        documentType: "Command",
      },
    );
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

    const { vpc } = createPrivateVpc(this, network);

    // Create an Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(
      this,
      `BitcoinALB-${network}`,
      {
        vpc,
        internetFacing: true,
      },
    );

    const userData = ec2.UserData.forLinux();

    blockchainDataBucket.grantRead(role);

    const confTemplate = compile<{ vpc_cidr: string }>(
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
    writeFileSync(
      "/tmp/bitcoin.conf",
      confTemplate({ vpc_cidr: vpc.vpcCidrBlock }),
      "utf8",
    );
    const bitcoinConfAsset = new s3a.Asset(this, `BitcoinConf-${network}`, {
      path: "/tmp/bitcoin.conf",
    });
    bitcoinConfAsset.grantRead(role);
    const bitcoinConf = userData.addS3DownloadCommand({
      bucket: bitcoinConfAsset.bucket,
      bucketKey: bitcoinConfAsset.s3ObjectKey,
    });
    bitcoinExeAsset.grantRead(role);
    const bitcoindArchive = userData.addS3DownloadCommand({
      bucket: bitcoinExeAsset.bucket,
      bucketKey: bitcoinExeAsset.s3ObjectKey,
    });
    const template = compile<{
      bitcoin_archive: string;
      data_dir_s3: string;
      bitcoin_conf: string;
      data_dir: string;
      blockchain_data: string;
    }>(
      readFileSync(
        path.join(__dirname, "../../bitcoin/config.sh.tmpl"),
        "utf8",
      ),
    );
    // bucketname is an attribute so we need to use cloud formation joins to construct it
    const data_dir_s3 = cdk.Fn.join("", [
      "s3://",
      cdk.Fn.join("/", [
        blockchainDataBucket.bucketName,
        network === "testnet" ? "testnet.tar.gz" : "mainnet.tar.gz",
      ]),
    ]);
    const setupScript = template({
      bitcoin_archive: bitcoindArchive,
      data_dir_s3: data_dir_s3,
      bitcoin_conf: bitcoinConf,
      data_dir: `/home/ec2-user/.bitcoin${
        network === "testnet" ? "/testnet3" : ""
      }`,
      blockchain_data: "/home/ec2-user/.bitcoin",
    });
    userData.addCommands(setupScript);

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
    userData.addS3DownloadCommand({
      bucket: cloudwatchConfiguration.bucket,
      bucketKey: cloudwatchConfiguration.s3ObjectKey,
      localFile: "/opt/amazon-cloudwatch-agent.json",
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
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.M7G,
        ec2.InstanceSize.LARGE,
      ),
      userData,
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      healthCheck: autoscaling.HealthCheck.ec2({
        grace: cdk.Duration.seconds(360),
      }),
      minCapacity: 2,
      role,
      spotPrice: "0.1", // Define your spot price
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: autoscaling.BlockDeviceVolume.ebs(60, {
            volumeType: autoscaling.EbsDeviceVolumeType.GP3,
          }),
        },
      ],
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

    asg.addUserData(
      `/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/amazon-cloudwatch-agent.json`,
    );
    if (network === "testnet") {
      asg.addUserData(
        "runuser -l  ec2-user -c 'bitcoind -testnet 2>> /home/ec2-user/bitcoin.stderr.log 1>> /home/ec2-user/bitcoin.stdout.log'",
      );
    }

    // Attach the ASG to the ALB
    listener.addTargets(`BitcoinTarget-${network}`, {
      port: 18332,
      targets: [asg],
      protocol: elbv2.ApplicationProtocol.HTTP,
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
