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
    collectionId: "bc8e1807-2d51-43ef-8b61-a2d6f0bb95b9" as ID_Collection,
    fundingDao,
    mempoolBitcoinClient: createMempoolBitcoinClient({ network: "regtest" }),
  });
}
