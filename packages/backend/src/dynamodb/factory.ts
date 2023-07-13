import type { IFundingDao } from "../dao/funding.js";
import { tableNames } from "../utils/config.js";
import { createDb } from "./create.js";
import { FundingDao } from "./funding.js";

export function createDynamoDbFundingDao<
  ItemMeta extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {}
>(): IFundingDao<ItemMeta, CollectionMeta> {
  const allTableNames = tableNames.get();
  FundingDao.TABLE_NAME = allTableNames.funding ?? FundingDao.TABLE_NAME;
  return new FundingDao<ItemMeta, CollectionMeta>(createDb());
}
