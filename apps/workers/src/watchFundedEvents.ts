import {
  createDynamoDbFundingDao,
  createStorageFundingDocDao,
  inscriptionBucket,
  watchForFunded,
} from "@0xflick/ordinals-backend";
import { createMempoolBitcoinClient } from "./mempool.js";

export async function start(network: "mainnet" | "testnet" = "testnet") {
  console.log("🚀 starting funded event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  const allCollections = await fundingDao.getAllCollections();
  for (const collection of allCollections) {
    watchForFunded({
      collectionId: collection.id,
      fundingDao,
      fundingDocDao,
      mempoolBitcoinClient: createMempoolBitcoinClient({ network }),
      pollFundingsInterval: 20000,
    });
  }
}
