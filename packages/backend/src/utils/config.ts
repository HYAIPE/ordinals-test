import { lazySingleton } from "@0xflick/ordinals-models";

export const awsEndpoint = lazySingleton(() => {
  return process.env.AWS_ENDPOINT_URL;
});

export const awsRegion = lazySingleton(() => {
  return process.env.AWS_REGION;
});

export const inscriptionBucket = lazySingleton(() => {
  return process.env.INSCRIPTION_BUCKET || "inscriptions";
});

export const dynamoDbUrl = lazySingleton(() => {
  return process.env.DYNAMODB_URL;
});

export const dynamoDbRegion = lazySingleton(() => {
  return process.env.DYNAMODB_REGION || "us-east-1";
});

export const dynamoDbSslEnabled = lazySingleton(() => {
  return !(
    process.env.DYNAMODB_SSL_ENABLED === "false" ||
    process.env.DYNAMODB_SSL_ENABLED === "0" ||
    typeof process.env.DYNAMODB_SSL_ENABLED === "undefined"
  );
});

export const tableNames = lazySingleton(() => {
  const tableConfig: Record<string, string> = JSON.parse(
    process.env.TABLE_NAMES || "{}"
  );
  return tableConfig;
});

export const regtestMempoolUrl = lazySingleton(() => {
  return process.env.REGTEST_MEMPOOL_URL ?? "http://localhost:80";
});
export const testnetMempoolUrl = lazySingleton(() => {
  return process.env.TESTNET_MEMPOOL_URL ?? "https://mempool.space/testnet";
});
export const mainnetMempoolUrl = lazySingleton(() => {
  return process.env.MAINNET_MEMPOOL_URL ?? "https://mempool.space";
});
