import { BitcoinNetworkNames } from "../bitcoin";

export interface IInitScript {
  type: "utf8" | "hex";
  value: string;
}

export interface IInscriptionDocCommon {
  network: BitcoinNetworkNames;
  initTapKey: string;
  initLeaf: string;
  initCBlock: string;
  secKey: string;
  totalFee: number;
  overhead: number;
  padding: number;
}

export interface IInscriptionDocFunding extends IInscriptionDocCommon {
  status: "funding";
  fundingAddress: string;
  fundingAmount: number;
  initScript: IInitScript;
  initTapKey: string;
  initLeaf: string;
  initCBlock: string;
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
