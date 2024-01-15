import { MempoolClient, createMempoolClient } from "@0xflick/ordinals-backend";
import { BitcoinNetworkNames } from "@0xflick/ordinals-models";
import { IConfigContext } from "./config.js";

export interface IBitcoinContext {
  createMempoolBitcoinClient: (opts: {
    network: BitcoinNetworkNames;
  }) => MempoolClient["bitcoin"];
}
export function createBitcoinContext(
  config: Pick<
    IConfigContext,
    | "bitcoinRegtestMempoolEndpoint"
    | "bitcoinTestnetMempoolEndpoint"
    | "bitcoinMainnetMempoolEndpoint"
  >,
): IBitcoinContext {
  const urlForNetworkName = (network: BitcoinNetworkNames): string => {
    switch (network) {
      case "regtest":
        return config.bitcoinRegtestMempoolEndpoint;
      case "testnet":
        return config.bitcoinTestnetMempoolEndpoint;
      case "mainnet":
        return config.bitcoinMainnetMempoolEndpoint;
      default:
        throw new Error(`Unknown Bitcoin network: ${network}`);
    }
  };
  return {
    createMempoolBitcoinClient({ network }) {
      const url = new URL(urlForNetworkName(network));
      const protocol = url.protocol.slice(0, -1);
      if (!["http", "https"].includes(protocol)) {
        throw new Error(`Unsupported protocol: ${protocol}`);
      }
      return createMempoolClient({
        network,
        hostname: url.host,
        protocol: protocol as "http" | "https",
      }).bitcoin;
    },
  };
}
