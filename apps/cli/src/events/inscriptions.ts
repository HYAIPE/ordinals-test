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

export function watchForFundingEvents(
  collectionId: ID_Collection,
  notifier: Parameters<typeof watchForFundings>[1]
) {
  console.log("🚀 starting funding event watcher");
  const fundingDao = createDynamoDbFundingDao();
  return watchForFundings(
    {
      collectionId,
      fundingDao,
      mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
      pollInterval: 2000,
    },
    notifier
  );
}

export function watchForFundedEvents(
  collectionId: ID_Collection,
  notifier: Parameters<typeof watchForFunded>[1]
) {
  console.log("🚀 starting funded event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  return watchForFunded(
    {
      collectionId,
      fundingDao,
      fundingDocDao,
      mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
      pollFundingsInterval: 2000,
    },
    notifier
  );
}

export function watchForGenesisEvents(
  collectionId: ID_Collection,
  notifier: Parameters<typeof watchForGenesis>[1]
) {
  console.log("🚀 starting genesis event watcher");
  const fundingDao = createDynamoDbFundingDao();
  const fundingDocDao = createStorageFundingDocDao({
    bucketName: inscriptionBucket.get(),
  });
  return watchForGenesis(
    {
      collectionId,
      fundingDao,
      fundingDocDao,
      mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
    },
    notifier
  );
}
