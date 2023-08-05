import fs from "fs"
const outputs = JSON.parse(await fs.promises.readFile("./outputs.json", "utf8"));

const tableNames = {};
let inscriptionBucketName;
for (const [key, value] of Object.entries(outputs['ordinal-backend'])) {
  if (key.startsWith("DynamoDBRbacTableName")) {
    tableNames.rbac = value;
  } else if (key.startsWith("DynamoDBUserNonceTable")) {
    tableNames.userNonce = value;
  } else if (key.startsWith("DynamoDBFundingTableName")) {
    tableNames.funding = value;
  } else if (key.startsWith("DynamoDBClaimsTableName")) {
    tableNames.claims = value;
  } else if (key.startsWith("StorageInscriptionBucketName")) {
    inscriptionBucketName = value;
  }
}
console.log(`TABLE_NAMES=${JSON.stringify(tableNames)}`)
console.log(`INSCRIPTION_BUCKET=${inscriptionBucketName}`)
