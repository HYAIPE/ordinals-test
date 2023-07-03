export interface InscriptionFile {
  content: ArrayBuffer;
  mimetype: string;
}

export interface WritableInscription {
  leaf: string;
  tapkey: string;
  cblock: string;
  inscriptionAddress: string;
  txsize: number;
  fee: number;
  file?: InscriptionFile;
  script: BitcoinScriptData[];
}

export type BitcoinScriptData = { base64: string } | string;
export type BitcoinNetworkNames = "mainnet" | "testnet" | "regtest";
