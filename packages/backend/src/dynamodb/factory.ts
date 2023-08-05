import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { IFundingDao } from "../dao/funding.js";
import { tableNames } from "../utils/config.js";
import { getDb } from "./create.js";
import { FundingDao } from "./funding.js";
import { ClaimsDao } from "./claims.js";

export function createDynamoDbFundingDao<
  ItemMeta extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {}
>(): IFundingDao<ItemMeta, CollectionMeta> {
  const allTableNames = tableNames.get();
  FundingDao.TABLE_NAME = allTableNames.funding ?? FundingDao.TABLE_NAME;
  return new FundingDao<ItemMeta, CollectionMeta>(getDb());
}

export function createDynamoDbClaimsDao({
  claimsTableName,
  db,
}: {
  claimsTableName?: string;
  db: DynamoDBDocumentClient;
}) {
  ClaimsDao.TABLE_NAME = claimsTableName ?? ClaimsDao.TABLE_NAME;
  return new ClaimsDao(db);
}
