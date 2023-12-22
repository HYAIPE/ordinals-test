export interface InscriptionId {
  id: string;
  fundingAddress: string;
  tapKey: string;
}

export interface InscriptionFile {
  id?: InscriptionId;
  content: ArrayBuffer;
  mimetype: string;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

export type BitcoinScriptData = { base64: string } | string;
export type BitcoinNetworkNames = "mainnet" | "testnet" | "regtest";
