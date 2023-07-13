import { ID_Collection } from "@0xflick/ordinals-models";
import { IIncrementingRevealDao } from "../dao/ordinals/incrementingReveal.js";
import { IFundingDao } from "../dao/funding.js";

export class IncrementingRevealDao<
  ItemInputType extends Record<string, any> = {},
  ItemMeta extends Record<string, any> = {},
  ItemReturnType = any,
  CollectionInputType extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {},
  CollectionReturnType = any
> implements IIncrementingRevealDao
{
  private fundingDao: IFundingDao<
    ItemInputType,
    ItemMeta,
    ItemReturnType,
    CollectionInputType,
    CollectionMeta,
    CollectionReturnType
  >;
  public collectionId: ID_Collection;

  constructor(
    collectionId: ID_Collection,
    fundingDao: IFundingDao<
      ItemInputType,
      ItemMeta,
      ItemReturnType,
      CollectionInputType,
      CollectionMeta,
      CollectionReturnType
    >
  ) {
    this.fundingDao = fundingDao;
    this.collectionId = collectionId;
  }

  public async nextTokenId() {
    const nextTokenId = await this.fundingDao.incrementCollectionTotalCount(
      this.collectionId
    );
    return { tokenId: nextTokenId };
  }

  public async getCollection(id: ID_Collection) {
    return this.fundingDao.getCollection(id);
  }
}
