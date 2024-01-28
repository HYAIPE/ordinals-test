import {
  createMempoolClient,
  regtestMempoolUrl,
  testnetMempoolUrl,
  mainnetMempoolUrl,
} from "@0xflick/ordinals-backend";
import mempoolJS from "@0xflick/mempool.js";
import { BitcoinNetworkNames } from "@0xflick/ordinals-models";

type MempoolClient = ReturnType<typeof mempoolJS>;
export interface IBitcoinContext {
  createMempoolBitcoinClient: (opts: {
    network: BitcoinNetworkNames;
  }) => MempoolClient["bitcoin"];
}
const urlForNetworkName = (network: BitcoinNetworkNames): string | null => {
  switch (network) {
    case "regtest":
      return regtestMempoolUrl.get();
    case "testnet":
      return testnetMempoolUrl.get();
    case "mainnet":
      return mainnetMempoolUrl.get();
    default:
      throw new Error(`Unknown Bitcoin network: ${network}`);
  }
};
export function createMempoolBitcoinClient({
  network,
}: {
  network: BitcoinNetworkNames;
}): MempoolClient["bitcoin"] {
  let urlStr = urlForNetworkName(network);
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
  }).bitcoin;
}
