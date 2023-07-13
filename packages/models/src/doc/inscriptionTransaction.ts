import type {
  BitcoinScriptData,
  WritableInscription,
} from "@0xflick/inscriptions";
import { BitcoinNetworkNames } from "../bitcoin.js";
import { ID_AddressInscription } from "../addressInscription.js";

export {
  WritableInscription,
  InscriptionFile,
  InscriptionId,
  InscriptionContent,
} from "@0xflick/inscriptions";

export interface IInscriptionDocCommon {
  id: ID_AddressInscription;
  network: BitcoinNetworkNames;
  fundingAddress: string;
  fundingAmountBtc: string;
  initTapKey: string;
  initLeaf: string;
  initCBlock: string;
  initScript: BitcoinScriptData[];
  secKey: string;
  totalFee: number;
  overhead: number;
  padding: number;
  writableInscriptions: WritableInscription[];
}

export interface IInscriptionDocFundingWait extends IInscriptionDocCommon {
  status: "funding-wait";
}

export interface IInscriptionDocFunding extends IInscriptionDocCommon {
  status: "funding";
}

export interface IInscriptionDocFunded
  extends Omit<IInscriptionDocFunding, "status"> {
  status: "funded";
  fundingTxid: string;
  fundingVout: number;
}

export interface IInscriptionDocGenesis
  extends Omit<IInscriptionDocFunded, "status"> {
  status: "genesis";
  genesisTxid: string;
}

export interface IInscriptionDocReveal
  extends Omit<IInscriptionDocGenesis, "status"> {
  status: "reveal";
  revealTxid: string;
}

export type TInscriptionDoc =
  | IInscriptionDocFundingWait
  | IInscriptionDocFunding
  | IInscriptionDocFunded
  | IInscriptionDocGenesis
  | IInscriptionDocReveal;
