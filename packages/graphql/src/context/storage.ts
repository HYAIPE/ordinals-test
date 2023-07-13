import {
  IFundingDocDao,
  createStorageFundingDocDao,
} from "@0xflick/ordinals-backend";
import { IAwsContext } from "./aws.js";
import { IConfigContext } from "./config.js";

export interface IStorageContext {
  fundingDocDao: IFundingDocDao;
}

export function createStorageContext({
  s3Client,
  inscriptionBucket,
}: IAwsContext & IConfigContext): IStorageContext {
  const fundingDocDao = createStorageFundingDocDao({
    s3Client,
    bucketName: inscriptionBucket,
  });
  return {
    fundingDocDao,
  };
}
