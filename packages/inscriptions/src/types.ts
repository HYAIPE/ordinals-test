export interface InscriptionFile {
  content: ArrayBuffer;
  mimetype: string;
  sha256: string;
}

export interface WritableInscription {
  leaf: string;
  tapkey: string;
  cblock: string;
  inscriptionAddress: string;
  txsize: number;
  fee: number;
  script: string[];
  script_orig: (string | Uint8Array)[];
}

export type BitcoinNetworkNames = "mainnet" | "testnet" | "regtest";
