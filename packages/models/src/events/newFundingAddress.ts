import { BitcoinNetworkNames } from "../bitcoin.js";

export interface INewFundingAddressModel {
  address: string;
  amount: number;
  network: BitcoinNetworkNames;
  totalFee: number;
  overhead: number;
  padding: number;
  s3Key: string;
  s3Bucket: string;
  s3Region: string;
}

export const newFundingAddressEventType = "ordinal_funding_request_start";

export type TNewFundingAddressEventType = typeof newFundingAddressEventType;
export interface INewFundingAddressEvent {
  type: TNewFundingAddressEventType;
  details: INewFundingAddressModel;
}
