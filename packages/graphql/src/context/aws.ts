import { createS3Client } from "@0xflick/ordinals-backend";
import type { S3Client } from "@aws-sdk/client-s3";
import { IConfigContext } from "./config";

export interface IAwsContext {
  s3Client: S3Client;
}

export function createAwsContext(config: IConfigContext): IAwsContext {
  const s3Client = createS3Client({
    endpoint: config.awsEndpoint,
    region: config.awsRegion,
  });
  return {
    s3Client,
  };
}
