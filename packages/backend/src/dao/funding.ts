import {
  IAddressInscriptionModel,
  TInscriptionDoc,
  InscriptionFile,
  InscriptionId,
  TCollectionModel,
  ID_Collection,
  TFundingStatus,
  IPaginatedResult,
  IPaginationOptions,
} from "@0xflick/ordinals-models";

export const DISALLOWED_META_KEYS = [
  "id",
  "address",
  "network",
  "contentIds",
  "name",
  "collectionId",
  "maxSupply",
  "totalCount",
  "collectionName",
  "fundingLastChecked",
  "status",
  "fundingStatus",
];

export interface IFundingDao<
  ItemMeta extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {}
> {
  getAllFundingByAddressCollection(opts: {
    collectionId: ID_Collection;
    address: string;
  }): Promise<IAddressInscriptionModel<ItemMeta>[]>;
  listAllFundingByAddressCollectionPaginated(
    opts: {
      collectionId: ID_Collection;
      address: string;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<IAddressInscriptionModel<ItemMeta>>>;
  listAllFundingByAddressCollection(
    opts: {
      collectionId: ID_Collection;
      address: string;
    } & IPaginationOptions
  ): AsyncGenerator<IAddressInscriptionModel<ItemMeta>>;
  getAllFundingsByStatus(opts: {
    id: ID_Collection;
    fundingStatus: TFundingStatus;
  }): Promise<
    { address: string; id: string; lastChecked: Date; timesChecked: number }[]
  >;
  listAllFundingsByStatus(opts: {
    id: ID_Collection;
    fundingStatus: TFundingStatus;
  }): AsyncGenerator<{
    address: string;
    id: string;
    lastChecked?: Date;
    timesChecked: number;
    fundingAmountSat: number;
  }>;
  listAllFundingByStatusPaginated(
    opts: {
      id: ID_Collection;
      fundingStatus: TFundingStatus;
    } & IPaginationOptions
  ): Promise<
    IPaginatedResult<{
      address: string;
      id: string;
      lastChecked?: Date;
      timesChecked: number;
    }>
  >;
  createFunding(item: IAddressInscriptionModel<ItemMeta>): Promise<void>;
  updateFundingLastChecked(opt: {
    id: string;
    lastChecked: Date;
    resetTimesChecked?: boolean;
  }): Promise<void>;
  addressFunded(item: {
    id: string;
    fundingTxid: string;
    fundingVout: number;
  }): Promise<void>;
  genesisFunded(item: { id: string; genesisTxid: string }): Promise<void>;
  revealFunded(item: { id: string; revealTxid: string }): Promise<void>;
  getFunding(id: string): Promise<IAddressInscriptionModel<ItemMeta>>;
  deleteFunding(id: string): Promise<void>;
  createCollection(item: TCollectionModel<CollectionMeta>): Promise<void>;
  getCollection(id: ID_Collection): Promise<TCollectionModel<CollectionMeta>>;
  getCollectionByName(
    name: string
  ): Promise<TCollectionModel<CollectionMeta>[]>;
  getAllCollections(): Promise<TCollectionModel<CollectionMeta>[]>;
  deleteCollection(id: ID_Collection): Promise<void>;
  incrementCollectionTotalCount(id: ID_Collection): Promise<number>;
  updateMaxSupply(id: ID_Collection, maxSupply: number): Promise<void>;
  updateCollectionMeta(
    id: ID_Collection,
    meta: CollectionMeta
  ): Promise<TCollectionModel<CollectionMeta>>;
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
