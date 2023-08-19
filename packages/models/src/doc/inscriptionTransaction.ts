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
  tip: number;
}

export type TInscriptionDoc = IInscriptionDocCommon;