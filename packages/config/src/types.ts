import { Chain } from "@wagmi/core/chains";
import type { config } from "./wagmi/index.js";

export type TDeployment = "localstack" | "aws";

export interface IDeploymentConfig {
  name: TDeployment;
  aws?: IAwsConfig;
}

export interface IAwsConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}

export interface IWagmiConfig {
  config: typeof config;
  chains: Record<Chain["id"], TAdminChain<Chain>>;
}

export type TBitcoinNetworkName = "regtest" | "testnet" | "mainnet";

export interface IBitcoinApi {
  network: TBitcoinNetworkName;
  mempoolUrl: string;
}
export interface IBitcoinConfig {
  apis: IBitcoinApi[];
}

export interface IConfig {
  wagmi: IWagmiConfig;
  bitcoin: IBitcoinConfig;
  deployment: IDeploymentConfig;
}

export type TAdminChain<C extends Chain> = C & {
  ensAdmin?: string;
};
