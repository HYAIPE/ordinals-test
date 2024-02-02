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
    | "bitcoinMainnetMempoolAuth"
    | "bitcoinTestnetMempoolAuth"
  >,
): IBitcoinContext {
  const urlForNetworkName = (
    network: BitcoinNetworkNames,
  ): [string | null, string | null] => {
    switch (network) {
      case "regtest":
        return [config.bitcoinRegtestMempoolEndpoint, null];
      case "testnet":
        return [
          config.bitcoinTestnetMempoolEndpoint,
          config.bitcoinTestnetMempoolAuth,
        ];
      case "mainnet":
        return [
          config.bitcoinMainnetMempoolEndpoint,
          config.bitcoinMainnetMempoolAuth,
        ];
      default:
        throw new Error(`Unknown Bitcoin network: ${network}`);
    }
  };
  return {
    createMempoolBitcoinClient({ network }) {
      let [urlStr, auth] = urlForNetworkName(network);
      if (urlStr !== null) {
        // Prevent mempool client from mutating the URL
        network = "regtest";
      }
      if (!urlStr) {
        urlStr = "https://mempool.space";
      }
      const url = new URL(urlStr);
      const protocol = url.protocol.slice(0, -1);
      if (!["http", "https"].includes(protocol)) {
        throw new Error(`Unsupported protocol: ${protocol}`);
      }
      return createMempoolClient({
        network,
        hostname: url.host,
        protocol: protocol as "http" | "https",
        config: {
          ...(auth && {
            headers: {
              Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
            },
          }),
        },
      }).bitcoin;
    },
  };
}
