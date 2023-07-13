import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  IAddressInscriptionModel,
  toAddressInscriptionId,
  toCollectionId,
  TCollectionModel,
  toBitcoinNetworkName,
  ID_Collection,
} from "@0xflick/ordinals-models";
import { IFundingDao } from "../dao/funding.js";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

export type TFundingDb<T extends Record<string, any>> = {
  pk: string;
  id: string;
  address: string;
  network: string;
  contentIds: string[];
  collectionId?: string;
} & T;

export type TFundingCollectionDb<T extends Record<string, any>> = {
  pk: string;
  collectionId: string;
  collectionName: string;
  maxSupply: number;
  totalCount: number;
} & T;

export type TFundingItemReturner<
  ItemInputType extends Record<string, any>,
  ItemReturnType = Record<string, any>
> = (item: IAddressInscriptionModel<ItemInputType>) => Promise<ItemReturnType>;
export type TFundingCollectionReturner<
  ItemInputType extends Record<string, any>,
  ItemReturnType = Record<string, any>
> = (item: TCollectionModel<ItemInputType>) => Promise<ItemReturnType>;

export class FundingDao<
  ItemInputType extends Record<string, any> = {},
  ItemMeta extends Record<string, any> = {},
  ItemReturnType = any,
  CollectionInputType extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {},
  CollectionReturnType = any
> implements
    IFundingDao<
      ItemInputType,
      ItemMeta,
      ItemReturnType,
      CollectionInputType,
      CollectionMeta,
      CollectionReturnType
    >
{
  public static TABLE_NAME = "Funding";

  private client: DynamoDBClient;
  private itemFundingUpdater: TFundingItemReturner<
    ItemInputType,
    ItemReturnType
  >;
  private collectionFundingUpdater: TFundingCollectionReturner<
    CollectionInputType,
    CollectionReturnType
  >;

  constructor({
    client,
    itemFundingUpdater,
    collectionFundingUpdater,
  }: {
    client: DynamoDBClient;
    itemFundingUpdater: TFundingItemReturner<ItemInputType, ItemReturnType>;
    collectionFundingUpdater: TFundingCollectionReturner<
      CollectionInputType,
      CollectionReturnType
    >;
  }) {
    this.client = client;
    this.itemFundingUpdater = itemFundingUpdater;
    this.collectionFundingUpdater = collectionFundingUpdater;
  }

  public async createFunding(item: IAddressInscriptionModel<ItemInputType>) {
    const db = this.toFundingDb(item);
    const response = await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
      })
    );
    if (response.Attributes === undefined) {
      throw new Error("Failed to create funding");
    }
    return this.itemFundingUpdater(
      this.fromFundingDb<ItemInputType>(
        response.Attributes as TFundingDb<ItemInputType>
      )
    );
  }

  public async getFunding(id: string) {
    const db = await this.client.send(
      new GetCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `FUNDING#${id}`,
        },
      })
    );
    return this.fromFundingDb(db.Item as TFundingDb<ItemMeta>);
  }

  public async deleteFunding(id: string) {
    await this.client.send(
      new DeleteCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `FUNDING#${id}`,
        },
      })
    );
  }

  public async createCollection(item: TCollectionModel<CollectionInputType>) {
    const db = this.toCollectionDb(item);
    const response = await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
      })
    );
    if (response.Attributes === undefined) {
      throw new Error("Failed to create funding");
    }
    return this.collectionFundingUpdater(
      this.fromCollectionDb<CollectionInputType>(
        response.Attributes as TFundingCollectionDb<CollectionInputType>
      )
    );
  }

  public async getCollection(id: ID_Collection) {
    const db = await this.client.send(
      new GetCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `COLLECTION#${id}`,
        },
      })
    );
    return this.fromCollectionDb(
      db.Item as TFundingCollectionDb<CollectionMeta>
    );
  }

  public async deleteCollection(id: ID_Collection) {
    await this.client.send(
      new DeleteCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `COLLECTION#${id}`,
        },
      })
    );
  }

  public async incrementCollectionTotalCount(
    id: ID_Collection
  ): Promise<number> {
    const response = await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `COLLECTION#${id}`,
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "ADD totalCount :one",
        ExpressionAttributeValues: {
          ":one": 1,
        },
        ReturnValues: "ALL_NEW",
      })
    );
    if (!response.Attributes) {
      throw new Error("Collection not found");
    }
    return (response.Attributes?.totalCount as number) ?? 0;
  }

  public async updateMaxSupply(
    id: ID_Collection,
    maxSupply: number
  ): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `COLLECTION#${id}`,
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "SET maxSupply = :maxSupply",
        ExpressionAttributeValues: {
          ":maxSupply": maxSupply,
        },
      })
    );
  }

  async updateCollectionMeta(
    id: ID_Collection,
    meta: CollectionMeta,
    incrementCollectionTotalCount?: boolean
  ) {
    let updateExpression = Object.keys(meta).reduce((acc, key) => {
      return `${acc} SET #${key} = :${key}`;
    }, "");
    const expressionAttributeValues = Object.keys(meta).reduce(
      (acc, key) => ({
        ...acc,
        [`:${key}`]: meta[key],
      }),
      {}
    );
    const expressionAttributeNames = Object.keys(meta).reduce(
      (acc, key) => ({
        ...acc,
        [`#${key}`]: key,
      }),
      {}
    );
    if (incrementCollectionTotalCount) {
      updateExpression += " ADD #totalCount :one";
      expressionAttributeValues[":one"] = 1;
      expressionAttributeNames["#totalCount"] = "totalCount";
    }
    const response = await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `COLLECTION#${id}`,
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW",
      })
    );
    if (!response.Attributes) {
      throw new Error("Collection not found");
    }
    return this.fromCollectionDb(
      response.Attributes as TFundingCollectionDb<CollectionMeta>
    );
  }

  private toFundingDb<T extends Record<string, any>>({
    address,
    contentIds,
    collectionId,
    id,
    network,
    meta,
  }: IAddressInscriptionModel<T>): TFundingDb<T> {
    return {
      pk: `FUNDING#${id}`,
      id,
      address,
      collectionId,
      contentIds,
      network,
      ...(meta ? meta : ({} as T)),
    };
  }

  private toCollectionDb<T extends Record<string, any>>({
    id,
    maxSupply,
    totalCount,
    name,
    meta,
  }: TCollectionModel<T>): TFundingCollectionDb<T> {
    return {
      pk: `COLLECTION#${id}`,
      collectionId: id,
      collectionName: name,
      maxSupply,
      totalCount,
      ...(meta ? meta : ({} as T)),
    };
  }

  private fromCollectionDb<T extends Record<string, any>>({
    collectionId,
    maxSupply,
    collectionName,
    totalCount,
    ...meta
  }: TFundingCollectionDb<T>): TCollectionModel<T> {
    return {
      id: toCollectionId(collectionId),
      maxSupply: maxSupply,
      name: collectionName,
      totalCount: totalCount,
      meta: meta as T,
    };
  }

  private fromFundingDb<T extends Record<string, any>>({
    id,
    address,
    collectionId,
    contentIds,
    network,
    ...meta
  }: TFundingDb<T>): IAddressInscriptionModel<T> {
    return {
      address,
      contentIds,
      id: toAddressInscriptionId(id),
      network: toBitcoinNetworkName(network),
      collectionId: toCollectionId(collectionId),
      meta: meta as T,
    };
  }
}
