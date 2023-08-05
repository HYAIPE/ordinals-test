import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface IProps {}

export class Storage extends Construct {
  inscriptionBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    // Create the S3 buckets for inscriptions and axolotl inscriptions
    const inscriptionBucket = new s3.Bucket(this, "InscriptionBucket");
    this.inscriptionBucket = inscriptionBucket;
    new cdk.CfnOutput(this, "InscriptionBucketName", {
      value: this.inscriptionBucket.bucketName,
    });
  }
}
