import {
  createDynamoDbFundingDao,
  createStorageFundingDocDao,
  inscriptionBucket,
  watchForGenesis,
} from "@0xflick/ordinals-backend";
import { ID_Collection } from "@0xflick/ordinals-models";
import { createMempoolBitcoinClient } from "./mempool.js";

export function start() {
  console.log("🚀 starting genesis event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  watchForGenesis({
    collectionId: "5c6c1a08-ea36-4fb3-89e4-8449e0d08e4d" as ID_Collection,
    fundingDao,
    fundingDocDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
  });
}
