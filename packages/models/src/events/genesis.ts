import { INewFundingAddressModel } from "./newFundingAddress.js";

import { BitcoinNetworkNames } from "../bitcoin.js";

export const newFundingAddressEventType = "ordinal_funding_request_start";

export type TNewFundingAddressEventType = typeof newFundingAddressEventType;
export interface INewFundingAddressEvent {
  type: TNewFundingAddressEventType;
  details: INewFundingAddressModel;
}

export interface IGenesisModel {
  fundingEvent: INewFundingAddressModel;
}
