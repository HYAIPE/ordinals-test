import {
  createDynamoDbFundingDao,
  IFundingDao,
  TFundingCollectionReturner,
  TFundingItemReturner,
} from "@0xflick/ordinals-backend";

export interface DbContext {
  fundingDao: IFundingDao;
  typedFundingDao<
    ItemMeta extends Record<string, any> = {},
    CollectionMeta extends Record<string, any> = {},
  >(): IFundingDao<ItemMeta, CollectionMeta>;
}

export function createDbContext() {
  const context: DbContext = {
    fundingDao: createDynamoDbFundingDao<{}, {}>(),
    typedFundingDao<
      ItemMeta extends Record<string, any> = {},
      CollectionMeta extends Record<string, any> = {},
    >() {
      return createDynamoDbFundingDao<ItemMeta, CollectionMeta>();
    },
  };
  return context;
}
