import {
  watchForAllowance,
  createDynamoDbClaimsDao,
  getDb,
  tableNames,
  createDynamoDbFundingDao,
} from "@0xflick/ordinals-backend";

export async function start() {
  console.log("🚀 starting allowance event watcher");
  const db = getDb();
  const claimsDao = createDynamoDbClaimsDao({
    claimsTableName: tableNames.get().claims,
    db,
  });
  const fundingsDao = createDynamoDbFundingDao<{}, {}>();
  const allCollections = await fundingsDao.getAllCollections();
  await watchForAllowance({
    claimsDao,
    observables: [
      {
        contractAddress: process.env
          .AXOLOTL_ALLOWANCE_CONTRACT_ADDRESS! as `0x${string}`,
        chainId: 11155111,
        startBlockHeight: 3904660,
      },
    ],
    collectionIds: allCollections.map((collection) => collection.id),
  });
  console.log("📈 all caught up on events");
}
