import type { IFundingDao } from "../dao/funding.js";
import { tableNames } from "../utils/config.js";
import { createDb } from "./create.js";
import { FundingDao } from "./funding.js";

export function createDynamoDbFundingDao(): IFundingDao {
  const allTableNames = tableNames.get();
  FundingDao.TABLE_NAME = allTableNames.funding ?? FundingDao.TABLE_NAME;
  return new FundingDao(createDb());
}
