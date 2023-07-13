import type { S3Client } from "@aws-sdk/client-s3";
import { createS3Client } from "./create.js";
import { FundingDocDao } from "./inscriptions.js";
import { IFundingDocDao } from "../dao/funding.js";

export function createStorageFundingDocDao({
  bucketName,
  s3Client,
}: {
  bucketName: string;
  s3Client?: S3Client;
}): IFundingDocDao {
  s3Client = s3Client ?? createS3Client();
  return new FundingDocDao(s3Client, bucketName);
}
