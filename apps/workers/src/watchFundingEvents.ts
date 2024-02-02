import {
  createDynamoDbFundingDao,
  watchForFundings,
} from "@0xflick/ordinals-backend";
import { createMempoolBitcoinClient } from "./mempool.js";

export async function start(network: "mainnet" | "testnet" = "testnet") {
  console.log("🚀 starting funding event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const allCollections = await fundingDao.getAllCollections();
  for (const collection of allCollections) {
    await watchForFundings({
      collectionId: collection.id,
      fundingDao,
      mempoolBitcoinClient: createMempoolBitcoinClient({ network }),
      pollInterval: 20000,
    });
  }
}
