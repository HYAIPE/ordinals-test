import { configureChains, createConfig } from "@wagmi/core";
import { sepolia, goerli, mainnet, Chain } from "@wagmi/chains";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { IConfigContext, sepoliaRpcUrl } from "./config.js";
import { readTestAllowance, testAllowanceABI } from "@0xflick/ordinals-backend";

export type TWagmiContext = ReturnType<typeof createWagmiContext>;

const chains = configureChains<Chain>(
  [sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case sepolia.id:
            return {
              http: sepoliaRpcUrl.get(),
            };
          default:
            return null;
        }
      },
    }),
  ],
);

createConfig({
  publicClient: chains.publicClient,
});

export function createWagmiContext() {
  return {};
}
