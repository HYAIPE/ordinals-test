import {
  IAddressInscriptionModel,
  TInscriptionDoc,
  InscriptionFile,
  InscriptionId,
  TCollectionModel,
  ID_Collection,
} from "@0xflick/ordinals-models";

export interface IFundingDao<
  ItemInputType extends Record<string, any> = {},
  ItemMeta extends Record<string, any> = {},
  ItemReturnType = any,
  CollectionInputType extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {},
  CollectionReturnType = any
> {
  createFunding(
    item: IAddressInscriptionModel<ItemInputType>
  ): Promise<ItemReturnType>;
  getFunding(id: string): Promise<IAddressInscriptionModel<ItemMeta>>;
  deleteFunding(id: string): Promise<void>;
  createCollection(
    item: TCollectionModel<CollectionInputType>
  ): Promise<CollectionReturnType>;
  getCollection(id: ID_Collection): Promise<TCollectionModel<CollectionMeta>>;
  deleteCollection(id: ID_Collection): Promise<void>;
  incrementCollectionTotalCount(id: ID_Collection): Promise<number>;
  updateMaxSupply(id: ID_Collection, maxSupply: number): Promise<void>;
  updateCollectionMeta(
    id: ID_Collection,
    meta: CollectionMeta,
    incrementTotalCount?: boolean
  ): Promise<Partial<TCollectionModel<CollectionMeta>>>;
}

export interface IFundingDocDao {
  transactionKey(opts: { fundingAddress: string; id: string }): string;
  transactionContentKey(id: InscriptionId): string;
  updateOrSaveInscriptionTransaction(item: TInscriptionDoc): Promise<void>;
  saveInscriptionContent(item: InscriptionFile): Promise<void>;
  getInscriptionContent(id: InscriptionId): Promise<InscriptionFile>;
  getInscriptionTransaction(opts: {
    fundingAddress: string;
    id: string;
  }): Promise<TInscriptionDoc>;
}
