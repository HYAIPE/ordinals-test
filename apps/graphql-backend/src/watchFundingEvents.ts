import {
  createDynamoDbClaimsDao,
  createDynamoDbFundingDao,
  getDb,
  tableNames,
  watchForFundings,
} from "@0xflick/ordinals-backend";
import { ID_Collection } from "@0xflick/ordinals-models";
import { createMempoolBitcoinClient } from "./mempool.js";

export function start() {
  console.log("🚀 starting funding event watcher");
  const fundingDao = createDynamoDbFundingDao();
  watchForFundings({
    collectionId: "0307d97f-25d8-4789-b582-4f481f97af54" as ID_Collection,
    fundingDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "testnet" }),
  });
}
