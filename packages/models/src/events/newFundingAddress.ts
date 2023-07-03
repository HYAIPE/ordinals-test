import { ID_AddressInscription } from "../addressInscription.js";
import { TInscriptionDoc } from "../doc/inscriptionTransaction.js";

export interface INewFundingAddressModel {
  id: ID_AddressInscription;
  transaction?: TInscriptionDoc;
}

export const newFundingAddressEventType = "ordinal_funding_request_start";

export type TNewFundingAddressEventType = typeof newFundingAddressEventType;
export interface INewFundingAddressEvent {
  type: TNewFundingAddressEventType;
  details: INewFundingAddressModel;
}
