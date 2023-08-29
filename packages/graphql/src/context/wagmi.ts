import { configureChains, createConfig } from "@wagmi/core";
import { sepolia, Chain } from "@wagmi/chains";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { sepoliaRpcUrl } from "./config.js";

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
