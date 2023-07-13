import type { IFundingDao } from "../dao/funding.js";
import { tableNames } from "../utils/config.js";
import { createDb } from "./create.js";
import {
  FundingDao,
  TFundingCollectionReturner,
  TFundingItemReturner,
} from "./funding.js";

export function createDynamoDbFundingDao<
  ItemInputType extends Record<string, any> = {},
  ItemMeta extends Record<string, any> = {},
  ItemReturnType = any,
  CollectionInputType extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {},
  CollectionReturnType = any
>({
  itemFundingUpdater,
  collectionFundingUpdater,
}: {
  itemFundingUpdater: TFundingItemReturner<ItemInputType, ItemReturnType>;
  collectionFundingUpdater: TFundingCollectionReturner<
    CollectionInputType,
    CollectionReturnType
  >;
}): IFundingDao<
  ItemInputType,
  ItemMeta,
  ItemReturnType,
  CollectionInputType,
  CollectionMeta,
  CollectionReturnType
> {
  const allTableNames = tableNames.get();
  FundingDao.TABLE_NAME = allTableNames.funding ?? FundingDao.TABLE_NAME;
  return new FundingDao<
    ItemInputType,
    ItemMeta,
    ItemReturnType,
    CollectionInputType,
    CollectionMeta,
    CollectionReturnType
  >({
    client: createDb(),
    itemFundingUpdater,
    collectionFundingUpdater,
  });
}
