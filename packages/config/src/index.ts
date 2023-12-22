import { IConfig } from "./types.js";
import { mainnet, regtest, testnet } from "./bitcoin/index.js";
import {
  getAwsConfig,
  deployment as deploymentName,
} from "./deployments/index.js";
import { chains, config } from "./wagmi/index.js";

export const bitcoin = {
  apis: [mainnet, testnet, regtest],
};

export const deployment = getAwsConfig();

export const wagmi = { config, chains };

export default {
  bitcoin,
  deployment: {
    name: deploymentName.get(),
    aws: deployment,
  },
  wagmi,
} as IConfig;
