import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  awsEndpoint,
  awsRegion,
  dynamoDbRegion,
  dynamoDbSslEnabled,
} from "../utils/config.js";

let instance: DynamoDBDocumentClient;

export function createDb(opts?: DynamoDBClientConfig) {
  const config = {
    endpoint: awsEndpoint.get(),
    region: dynamoDbRegion.get() ?? awsRegion.get(),
    sslEnabled: dynamoDbSslEnabled.get(),
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
