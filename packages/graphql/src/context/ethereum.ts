import { Provider, JsonRpcProvider } from "ethers";
import { sepolia } from "@wagmi/chains";
import { IConfigContext } from "./config.js";
import { createLogger } from "@0xflick/ordinals-backend";

const logger = createLogger({
  name: "ethereum",
});

export interface IEthereumContext {
  providerForChain: (chainId: number) => Provider;
  defaultChainProvider: () => Provider;
  ensAdminForChain: (chainId: number) => string;
}

export function createEthereumContext(
  config: IConfigContext,
): IEthereumContext {
  const self = {
    defaultChainProvider: () => {
      return self.providerForChain(config.ethereumDefaultChainId);
    },
    providerForChain: (chainId: number) => {
      logger.debug(`Creating provider for chainId: ${chainId}`);
      switch (chainId) {
        case sepolia.id:
          logger.debug(
            `Creating provider for sepolia chainId: ${chainId} with url: ${config.sepoliaRpcUrl}`,
          );
          return new JsonRpcProvider(config.sepoliaRpcUrl, {
            name: sepolia.network,
            chainId: sepolia.id,
            ensAddress: config.sepoliaEnsRegistryAddress,
          });
        default:
          throw new Error(`Unsupported chainId: ${chainId}`);
      }
    },
    ensAdminForChain: (chainId: number) => {
      switch (chainId) {
        case sepolia.id:
          return config.sepoliaEnsAdmin;
        default:
          throw new Error(`Unsupported chainId: ${chainId}`);
      }
    },
  };
  return self;
}
