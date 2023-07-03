import {
  IFundingDocDao,
  createStorageFundingDocDao,
} from "@0xflick/ordinals-backend";
import { IAwsContext } from "./aws";

export interface IStorageContext {
  fundingDocDao: IFundingDocDao;
}

export function createStorageContext({
  s3Client,
}: IAwsContext): IStorageContext {
  const fundingDocDao = createStorageFundingDocDao(s3Client);
  return {
    fundingDocDao,
  };
}
