import { S3ClientConfig, S3Client } from "@aws-sdk/client-s3";

export function createS3Client(options?: S3ClientConfig) {
  return new S3Client(options ?? {});
}
