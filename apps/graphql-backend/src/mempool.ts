import {
  createMempoolClient,
  regtestMempoolUrl,
  testnetMempoolUrl,
  mainnetMempoolUrl,
  mainnetMempoolAuth,
  testnetMempoolAuth,
} from "@0xflick/ordinals-backend";
import mempoolJS from "@0xflick/mempool.js";
import { BitcoinNetworkNames } from "@0xflick/ordinals-models";

type MempoolClient = ReturnType<typeof mempoolJS>;
export interface IBitcoinContext {
  createMempoolBitcoinClient: (opts: {
    network: BitcoinNetworkNames;
  }) => MempoolClient["bitcoin"];
}
const urlForNetworkName = (
  network: BitcoinNetworkNames,
): [string | null, string | null] => {
  switch (network) {
    case "regtest":
      return [regtestMempoolUrl.get(), null];
    case "testnet":
      return [testnetMempoolUrl.get(), testnetMempoolAuth.get()];
    case "mainnet":
      return [mainnetMempoolUrl.get(), mainnetMempoolAuth.get()];
    default:
      throw new Error(`Unknown Bitcoin network: ${network}`);
  }
};
export function createMempoolBitcoinClient({
  network,
}: {
  network: BitcoinNetworkNames;
}): MempoolClient["bitcoin"] {
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
}
