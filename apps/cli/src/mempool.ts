import {
  MempoolClient,
  createMempoolClient,
  regtestMempoolUrl,
  testnetMempoolUrl,
  mainnetMempoolUrl,
  testnetMempoolAuth,
  mainnetMempoolAuth,
} from "@0xflick/ordinals-backend";
import { BitcoinNetworkNames } from "@0xflick/ordinals-models";

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
  const [u, auth] = urlForNetworkName(network);
  const url = new URL(u);
  const protocol = url.protocol.slice(0, -1);
  if (!["http", "https"].includes(protocol)) {
    throw new Error(`Unsupported protocol: ${protocol}`);
  }
  return createMempoolClient({
    network,
    hostname: url.hostname,
    protocol: protocol as "http" | "https",
    config: {
      ...(auth && {
        headers: {
          Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
        },
      }),
    },
  }).bitcoin as MempoolClient["bitcoin"];
}
