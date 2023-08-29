import { IConfig } from "./types.js";
import { mainnet, regtest, testnet } from "./bitcoin/index.js";
import { getAwsConfig } from "./deployments/index.js";
import { wagmiConfig } from "./wagmi/index.js";

export const bitcoin = {
  apis: [mainnet, testnet, regtest],
};

export const deployment = getAwsConfig();

export const wagmi = wagmiConfig;

export default {
  bitcoin,
  deployment,
  wagmi,
} as IConfig;
