import { createS3Client } from "@0xflick/ordinals-backend";
import type { S3Client } from "@aws-sdk/client-s3";
import { IConfigContext } from "./config.js";

export interface IAwsContext {
  s3Client: S3Client;
}

export function createAwsContext({
  awsEndpoint: endpoint,
  awsRegion: region,
}: IConfigContext): IAwsContext {
  const s3Client = createS3Client({
    endpoint,
    region,
    ...(endpoint
      ? {
          forcePathStyle: true,
        }
      : {}),
  });
  return {
    s3Client,
  };
}
