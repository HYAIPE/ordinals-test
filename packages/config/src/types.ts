import { Chain } from "@wagmi/chains";
import type { configureChains } from "@wagmi/core";

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
  chainConfig: ReturnType<typeof configureChains<Chain>>;
  chains: Record<Chain["name"], TAdminChain<Chain>>;
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
