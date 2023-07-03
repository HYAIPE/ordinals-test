import mempoolJS from "@0xflick/mempool.js";
import {
  mainnetMempoolUrl,
  testnetMempoolUrl,
  regtestMempoolUrl,
} from "../utils/config.js";
import {
  BitcoinNetworkNames,
  urlForNetworkName as reasonableDefaults,
} from "@0xflick/inscriptions";

function urlForNetworkName(network: BitcoinNetworkNames) {
  const environmentUrl = (() => {
    switch (network) {
      case "mainnet":
        return mainnetMempoolUrl.get();
      case "testnet":
        return testnetMempoolUrl.get();
      case "regtest":
        return regtestMempoolUrl.get();
    }
  })();
  if (environmentUrl) {
    return environmentUrl;
  }
  return reasonableDefaults(network);
}
export type MempoolClient = ReturnType<typeof createMempoolClient>;
export function createMempoolClient({
  network,
}: {
  network: BitcoinNetworkNames;
}) {
  const url = new URL(urlForNetworkName(network));
  const protocol = url.protocol.slice(0, -1);
  if (["http", "https"].includes(protocol)) {
    throw new Error(`Unsupported protocol: ${protocol}`);
  }
  return mempoolJS({
    network,
    hostname: url.hostname,
    protocol: protocol as "http" | "https",
  });
}
