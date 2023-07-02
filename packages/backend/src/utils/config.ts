import { lazySingleton } from "@0xflick/ordinals-models";

export const dynamoDbEndpoint = lazySingleton(() => {
  return process.env.DYNAMODB_ENDPOINT;
});

export const dynamoDbRegion = lazySingleton(() => {
  return process.env.DYNAMODB_REGION || "us-east-1";
});

export const tableNames = lazySingleton(() => {
  const tableConfig: Record<string, string> = JSON.parse(
    process.env.TABLE_NAMES || "{}"
  );
  return tableConfig;
});
