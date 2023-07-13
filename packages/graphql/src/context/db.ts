import {
  createDynamoDbFundingDao,
  IFundingDao,
  TFundingCollectionReturner,
  TFundingItemReturner,
} from "@0xflick/ordinals-backend";

export interface DbContext {
  fundingDao: IFundingDao;
  typedFundingDao<
    ItemInputType extends Record<string, any> = {},
    ItemMeta extends Record<string, any> = {},
    ItemReturnType = any,
    CollectionInputType extends Record<string, any> = {},
    CollectionMeta extends Record<string, any> = {},
    CollectionReturnType = any,
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
  >;
}

export function createDbContext() {
  const context: DbContext = {
    fundingDao: createDynamoDbFundingDao<{}, {}, void, {}, {}, void>({
      itemFundingUpdater: async () => {},
      collectionFundingUpdater: async () => {},
    }),
    typedFundingDao<
      ItemInputType extends Record<string, any> = {},
      ItemMeta extends Record<string, any> = {},
      ItemReturnType = any,
      CollectionInputType extends Record<string, any> = {},
      CollectionMeta extends Record<string, any> = {},
      CollectionReturnType = any,
    >({
      itemFundingUpdater,
      collectionFundingUpdater,
    }: {
      itemFundingUpdater: TFundingItemReturner<ItemInputType, ItemReturnType>;
      collectionFundingUpdater: TFundingCollectionReturner<
        CollectionInputType,
        CollectionReturnType
      >;
    }) {
      return createDynamoDbFundingDao<
        ItemInputType,
        ItemMeta,
        ItemReturnType,
        CollectionInputType,
        CollectionMeta,
        CollectionReturnType
      >({
        itemFundingUpdater,
        collectionFundingUpdater,
      });
    },
  };
  return context;
}
