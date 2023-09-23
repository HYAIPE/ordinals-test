import fs from "fs";
const outputs = JSON.parse(
  await fs.promises.readFile("./outputs.json", "utf8")
);

const tableNames = {};
let inscriptionBucketName;
for (const [key, value] of Object.entries(outputs["ordinal-backend"])) {
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

console.log(`TABLE_NAMES=${JSON.stringify(tableNames)}`);
console.log(`INSCRIPTION_BUCKET=${inscriptionBucketName}`);

// Check if ../apps/graphql-backend/.env exists
// If it does, then add or replace the TABLE_NAMES and INSCRIPTION_BUCKET lines
// otherwise ignore
const envPaths = ["../apps/graphql-backend/.env", "../apps/cli/.env"];

for (const envPath of envPaths) {
  try {
    fs.accessSync(envPath, fs.constants.F_OK);
    // file exists
    const envFile = await fs.promises.readFile(envPath, "utf8");
    const lines = envFile.split("\n");
    const newLines = [];
    let foundTableNames = false;
    let foundInscriptionBucket = false;
    for (const line of lines) {
      if (line.startsWith("TABLE_NAMES=")) {
        newLines.push(`TABLE_NAMES=${JSON.stringify(tableNames)}`);
        foundTableNames = true;
      } else if (line.startsWith("INSCRIPTION_BUCKET=")) {
        newLines.push(`INSCRIPTION_BUCKET=${inscriptionBucketName}`);
        foundInscriptionBucket = true;
      } else {
        newLines.push(line);
      }
    }
    if (!foundTableNames) {
      newLines.push(`TABLE_NAMES=${JSON.stringify(tableNames)}`);
    }
    if (!foundInscriptionBucket) {
      newLines.push(`INSCRIPTION_BUCKET=${inscriptionBucketName}`);
    }
    await fs.promises.writeFile(envPath, newLines.join("\n"));
    console.log(`Updated ${envPath}`);
  } catch (err) {
    // file does not exist
  }
}
