import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";

interface Props extends cdk.StackProps {}

export class AuroraServerlessV2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, { ...props }: Props = {}) {
    super(scope, id, props);

    // Create a VPC for the database
    const vpc = new ec2.Vpc(this, "AuroraVpc", {
      maxAzs: 2,
    });

    // Create an Aurora Serverless V2 database
    const auroraCluster = new rds.DatabaseCluster(this, "AuroraServerlessV2", {
      vpc,
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_05_1,
      }),
      serverlessV2MaxCapacity: 2,
      serverlessV2MinCapacity: 0.5,
      writer: rds.ClusterInstance.serverlessV2("write"),
      readers: [
        rds.ClusterInstance.serverlessV2("read1", {
          scaleWithWriter: true,
        }),
      ],
    });

    // Create a small EC2 instance to use as a bastion host
    const bastionSg = new ec2.SecurityGroup(this, "BastionSg", {
      vpc,
    });
    const bastion = new ec2.BastionHostLinux(this, "Bastion", {
      vpc,
      securityGroup: bastionSg,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO,
      ),
      instanceName: `${id}-bastion`,
    });
    // Attach the bastion to the aurora cluster
    auroraCluster.connections.allowFrom(bastion, ec2.Port.tcp(3306));

    // Output the endpoint
    new cdk.CfnOutput(this, "AuroraEndpoint", {
      value: auroraCluster.clusterEndpoint.hostname,
    });

    // Output the bastion host
    new cdk.CfnOutput(this, "BastionId", {
      value: bastion.instanceId,
    });
  }
}
