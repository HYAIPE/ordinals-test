import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  awsEndpoint,
  awsRegion,
  dynamoDbUrl,
  dynamoDbRegion,
  dynamoDbSslEnabled,
} from "../utils/config.js";

let instance: DynamoDBDocumentClient;

export function createDb(opts?: DynamoDBClientConfig) {
  const config = {
    endpoint: dynamoDbUrl.get() ?? awsEndpoint.get(),
    region: dynamoDbRegion.get() ?? awsRegion.get(),
    // sslEnabled: dynamoDbSslEnabled.get(),
    ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
      endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
      sslEnabled: false,
      region: "local",
    }),
    ...opts,
  };
  const ddb = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(ddb, {
    marshallOptions: {
      convertEmptyValues: true,
    },
  });
}

export function getDb() {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}
