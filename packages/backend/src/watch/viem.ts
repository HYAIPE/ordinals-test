import { lazySingleton } from "@0xflick/ordinals-models";
import { createPublicClient, http, HttpTransport, PublicClient } from "viem";
import { mainnet, sepolia, goerli } from "viem/chains";

let sepoliaClient: PublicClient<HttpTransport, typeof sepolia> | undefined =
  undefined;
let goerliClient: PublicClient<HttpTransport, typeof goerli> | undefined =
  undefined;
let mainnetClient: PublicClient<HttpTransport, typeof mainnet> | undefined =
  undefined;

export const sepoliaRpcUrl = lazySingleton(() => {
  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL not set");
  }
  return process.env.SEPOLIA_RPC_URL;
});

export function chainForChainId(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia;
    case goerli.id:
      return goerli;
    case mainnet.id:
      return mainnet;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export function clientForChain(
  chainId: number,
): PublicClient<
  HttpTransport,
  typeof sepolia | typeof goerli | typeof mainnet
> {
  switch (chainId) {
    case sepolia.id:
      if (!sepoliaClient) {
        sepoliaClient = createPublicClient({
          chain: sepolia,
          transport: http(sepoliaRpcUrl.get()),
        });
      }
      return sepoliaClient;
    case goerli.id:
      if (!goerliClient) {
        goerliClient = createPublicClient({
          chain: goerli,
          transport: http(),
        });
      }
      return goerliClient;
    case mainnet.id:
      if (!mainnetClient) {
        mainnetClient = createPublicClient({
          chain: mainnet,
          transport: http(),
        });
      }
      return mainnetClient;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}
