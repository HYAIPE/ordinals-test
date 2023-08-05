import {
  watchAllowanceEvents,
  createDynamoDbClaimsDao,
  getDb,
  tableNames,
} from "@0xflick/ordinals-backend";

export async function start() {
  console.log("🚀 starting allowance event watcher");
  const db = getDb();
  const claimsDao = createDynamoDbClaimsDao({
    claimsTableName: tableNames.get().claims,
    db,
  });
  await watchAllowanceEvents({
    claimsDao,
    observables: [
      {
        contractAddress: "0xebA311021913C299F4522aE5828A4257ec52492A",
        chainId: 11155111,
        startBlockHeight: 3904660,
      },
    ],
  });
  console.log("📈 all caught up on events");
}
