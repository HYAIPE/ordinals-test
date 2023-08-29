import {
  createDynamoDbFundingDao,
  createStorageFundingDocDao,
  inscriptionBucket,
  watchForFunded,
  watchForFundings,
  watchForGenesis,
} from "@0xflick/ordinals-backend";
import { ID_Collection } from "@0xflick/ordinals-models";
import { createMempoolBitcoinClient } from "../mempool.js";

export function watchForFundedEvents(collectionId: ID_Collection) {
  console.log("🚀 starting funded event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  return watchForFunded({
    collectionId,
    fundingDao,
    fundingDocDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
  });
}

export function watchForFundingEvents(collectionId: ID_Collection) {
  console.log("🚀 starting funding event watcher");
  const fundingDao = createDynamoDbFundingDao();
  return watchForFundings({
    collectionId,
    fundingDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
  });
}

export function watchForGenesisEvents(collectionId: ID_Collection) {
  console.log("🚀 starting genesis event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  return watchForGenesis({
    collectionId,
    fundingDao,
    fundingDocDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
  });
}
