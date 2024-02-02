import mempoolJS from "@0xflick/mempool.js";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";
import { MempoolConfig } from "@0xflick/mempool.js/lib/interfaces/index.js";

export type MempoolClient = ReturnType<typeof createMempoolClient>;
export function createMempoolClient({
  network,
  hostname,
  protocol,
  config,
}: {
  hostname: string;
  protocol: "http" | "https";
  network: BitcoinNetworkNames;
  config: MempoolConfig["config"];
}) {
  return mempoolJS({
    network,
    hostname,
    protocol,
    config,
  });
}
