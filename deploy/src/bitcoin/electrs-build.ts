import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class ElectrsDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to store the binary
    const bucket = new s3.Bucket(this, "ElectrsBinaryBucket", {
      versioned: true,
    });

    // Define the EC2 instance
    const userData = ec2.UserData.forLinux();
    const instance = new ec2.Instance(this, "ElectrsBuildInstance", {
      userData,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.M6G,
        ec2.InstanceSize.LARGE,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      vpc: new ec2.Vpc(this, "VPC", { maxAzs: 2 }),
    });

    instance.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonSSMManagedInstanceCore",
      ),
    );

    // User data to setup the environment and build electrs
    instance.userData.addCommands(
      "sudo yum update -y",
      "sudo yum install -y gcc gcc-c++ git clang",
      "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
      "source $HOME/.cargo/env",
      "git clone https://github.com/romanz/electrs.git",
      "cd electrs",
      "cargo build --release",
      // Upload the binary to the S3 bucket
      `aws s3 cp ./target/release/electrs s3://${bucket.bucketName}/electrs`,
      // Terminate the instance after the upload
      "sudo shutdown -h now",
    );

    // Add read/write permissions to the S3 bucket
    bucket.grantReadWrite(instance.role);

    new cdk.CfnOutput(this, "ElectrsBinaryBucketOutput", {
      value: bucket.bucketName,
    });
  }
}
