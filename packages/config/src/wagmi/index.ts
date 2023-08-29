import { configureChains } from "@wagmi/core";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { sepolia, sepoliaRpcUrl } from "./sepolia.js";
import { IWagmiConfig } from "../types.js";

type TChains = typeof sepolia;

export const chainConfig: ReturnType<typeof configureChains<TChains>> =
  configureChains<TChains>(
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

export const chains = {
  sepolia,
};

export const wagmiConfig: IWagmiConfig = {
  chainConfig,
  chains,
};
