import { S3ClientConfig, S3Client } from "@aws-sdk/client-s3";
import { deployment } from "@0xflick/ordinals-config";
export function createS3Client(options?: S3ClientConfig) {
  return new S3Client(
    options ?? {
      endpoint: deployment.endpoint,
      region: deployment.region,
    }
  );
}
