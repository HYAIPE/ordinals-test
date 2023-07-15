import fs from "fs"
const outputs = JSON.parse(await fs.promises.readFile("./outputs.json", "utf8"));

const tableNames = {};
for (const [key, value] of Object.entries(outputs['ordinal-backend'])) {
  if (key.startsWith("DynamoDBRbacTableName")) {
    tableNames.rbac = value;
  } else if (key.startsWith("DynamoDBUserNonceTable")) {
    tableNames.userNonce = value;
  }
}
console.log(`TABLE_NAMES=${JSON.stringify(tableNames)}`)
