import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  IAddressInscriptionModel,
  toAddressInscriptionId,
  toCollectionId,
  TCollectionModel,
  toBitcoinNetworkName,
  ID_Collection,
  IPaginationOptions,
  IPaginatedResult,
  decodeCursor,
  encodeCursor,
  paginate,
  TFundingStatus,
} from "@0xflick/ordinals-models";
import { IFundingDao } from "../dao/funding.js";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export type TFundingDb<T extends Record<string, any>> = {
  pk: string;
  id: string;
  address: string;
  network: string;
  contentIds: string[];
  collectionId?: string;
  fundingTxid?: string;
  fundingVout?: number;
  revealTxid?: string;
  genesisTxid?: string;
  lastChecked?: number;
  timesChecked: number;
  status: string;
} & T;

export type TFundingCollectionDb<T extends Record<string, any>> = {
  pk: string;
  collectionId: string;
  collectionName: string;
  maxSupply: number;
  totalCount: number;
} & T;

function excludePrimaryKeys<T extends Record<string, any>>(
  input: T
): Record<string, any> {
  const { pk, sk, ...rest } = input;
  return rest;
}

export class FundingDao<
  ItemMeta extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {}
> implements IFundingDao<ItemMeta, CollectionMeta>
{
  public static TABLE_NAME = "Funding";

  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  public async getAllFundingsByStatus({
    id,
    status,
  }: {
    id: ID_Collection;
    status: TFundingStatus;
  }) {
    const results: {
      address: string;
      id: string;
      lastChecked: Date;
      timesChecked: number;
    }[] = [];
    for await (const item of this.listAllFundingsByStatus({ id, status })) {
      results.push(item);
    }
    return results;
  }

  public listAllFundingsByStatus(opts: {
    id: ID_Collection;
    status: TFundingStatus;
  }): AsyncGenerator<
    { address: string; id: string; lastChecked: Date; timesChecked: number },
    any,
    unknown
  > {
    return paginate((options) =>
      this.listAllFundingByStatusPaginated({ ...opts, ...options })
    );
  }

  public async listAllFundingByStatusPaginated({
    id,
    status,
    cursor,
    limit,
  }: {
    id: ID_Collection;
    status: TFundingStatus;
  } & IPaginationOptions): Promise<
    IPaginatedResult<{
      address: string;
      id: string;
      lastChecked: Date;
      timesChecked: number;
    }>
  > {
    const pagination = decodeCursor(cursor);
    const result = await this.client.send(
      new QueryCommand({
        TableName: FundingDao.TABLE_NAME,
        IndexName: "collectionId-index",
        KeyConditionExpression: "collectionId = :collectionId, status = :sk",
        ExpressionAttributeValues: {
          ":collectionId": toCollectionId(id),
          ":sk": status,
        },
        ...(pagination && { ExclusiveStartKey: pagination.lastEvaluatedKey }),
        ...(limit && { Limit: limit }),
      })
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length || 0;
    const count = (pagination ? pagination.count : 0) + size;

    return {
      items: result.Items?.map((item) => ({
        address: item.address,
        id: item.id,
        lastChecked: item.lastChecked
          ? new Date(item.lastChecked)
          : new Date(0),
        timesChecked: item.timesChecked,
      })) as {
        address: string;
        id: string;
        lastChecked: Date;
        timesChecked: number;
      }[],
      cursor: encodeCursor({
        page,
        count,
        lastEvaluatedKey,
      }),
      page,
      count,
      size,
    };
  }

  public async createFunding(item: IAddressInscriptionModel<ItemMeta>) {
    const db = this.toFundingDb(item);
    await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
        ReturnValues: "NONE",
      })
    );
  }

  public async getFunding(id: string) {
    const db = await this.client.send(
      new GetCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "funding",
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
          pk: id,
          sk: "funding",
        },
      })
    );
  }

  public async updateFundingLastChecked({
    id,
    lastChecked,
  }: {
    id: string;
    lastChecked: Date;
  }) {
    await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "funding",
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression:
          "SET lastChecked = :lastChecked, timesChecked = timesChecked + :one",
        ExpressionAttributeValues: {
          ":lastChecked": lastChecked.getTime(),
          ":one": 1,
        },
      })
    );
  }

  public async addressFunded({
    id,
    fundingTxid,
    fundingVout,
  }: {
    id: string;
    fundingTxid: string;
    fundingVout: number;
  }) {
    await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "funding",
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression:
          "SET fundingTxid = :fundingTxid, fundingVout = :fundingVout, status = :status",
        ExpressionAttributeValues: {
          ":fundingTxid": fundingTxid,
          ":fundingVout": fundingVout,
          ":status": "funded",
        },
      })
    );
  }

  public async genesisFunded({
    genesisTxid,
    id,
  }: {
    id: string;
    genesisTxid: string;
  }) {
    await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "funding",
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "SET genesisTxid = :genesisTxid, status = :status",
        ExpressionAttributeValues: {
          ":genesisTxid": genesisTxid,
          ":status": "genesis",
        },
      })
    );
  }

  public async revealFunded({
    id,
    revealTxid,
  }: {
    id: string;
    revealTxid: string;
  }) {
    await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "funding",
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "SET revealTxid = :revealTxid, status = :status",
        ExpressionAttributeValues: {
          ":revealTxid": revealTxid,
          ":status": "revealed",
        },
      })
    );
  }

  public async createCollection(item: TCollectionModel<CollectionMeta>) {
    const db = this.toCollectionDb(item);
    await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
        ReturnValues: "NONE",
      })
    );
  }

  public async getCollection(id: ID_Collection) {
    const db = await this.client.send(
      new GetCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "collection",
        },
      })
    );
    return this.fromCollectionDb(
      db.Item as TFundingCollectionDb<CollectionMeta>
    );
  }

  public async getCollectionByName(name: string) {
    const db = await this.client.send(
      new QueryCommand({
        TableName: FundingDao.TABLE_NAME,
        IndexName: "collectionByName",
        KeyConditionExpression: "collectionName = :collectionName",
        ExpressionAttributeValues: {
          ":collectionName": name,
        },
      })
    );
    if (db.Items == null) {
      return [];
    }
    return db.Items.map((item) =>
      this.fromCollectionDb(item as TFundingCollectionDb<CollectionMeta>)
    );
  }

  public async deleteCollection(id: ID_Collection) {
    await this.client.send(
      new DeleteCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "collection",
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
          pk: id,
          sk: "collection",
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
          pk: id,
          sk: "collection",
        },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "SET maxSupply = :maxSupply",
        ExpressionAttributeValues: {
          ":maxSupply": maxSupply,
        },
      })
    );
  }

  async getAllCollections(): Promise<TCollectionModel<CollectionMeta>[]> {
    const models: TCollectionModel<CollectionMeta>[] = [];
    for await (const model of this.getAllCollectionIterator()) {
      models.push(model);
    }
    return models;
  }

  public getAllCollectionIterator() {
    return paginate((options) => this.getAllCollectionPaginated(options));
  }

  private async getAllCollectionPaginated(
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<TCollectionModel<CollectionMeta>>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.client.send(
      new ScanCommand({
        TableName: FundingDao.TABLE_NAME,
        IndexName: "GSI1",
        ...(pagination
          ? {
              ExclusiveStartKey: pagination.lastEvaluatedKey,
            }
          : {}),
        ...(options?.limit
          ? {
              Limit: options.limit,
            }
          : {}),
        FilterExpression: "sk = :sk",
        ExpressionAttributeValues: {
          ":sk": "collection",
        },
      })
    );

    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;
    const cursor = encodeCursor({ lastEvaluatedKey, page, count });
    return {
      items:
        result.Items?.map((item) =>
          this.fromCollectionDb(item as TFundingCollectionDb<CollectionMeta>)
        ) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }

  async updateCollectionMeta(id: ID_Collection, meta: CollectionMeta) {
    let updateExpression = Object.keys(meta).reduce((acc, key) => {
      return `${acc} SET #${key} = :${key}`;
    }, "");
    const expressionAttributeValues = Object.keys(meta).reduce(
      (acc, key) => ({
        ...acc,
        [`:${key}`]: meta[key],
      }),
      {} as Record<string, any>
    );
    const expressionAttributeNames = Object.keys(meta).reduce(
      (acc, key) => ({
        ...acc,
        [`#${key}`]: key,
      }),
      {} as Record<string, string>
    );
    const response = await this.client.send(
      new UpdateCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: id,
          sk: "collection",
        },
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
    status,
    fundingTxid,
    fundingVout,
    genesisTxid,
    revealTxid,
    meta,
    lastChecked,
    timesChecked,
  }: IAddressInscriptionModel<T>): TFundingDb<T> {
    return {
      pk: id,
      sk: "funding",
      id,
      address,
      collectionId,
      contentIds,
      network,
      status,
      timesChecked,
      ...(lastChecked && { lastChecked: lastChecked.getTime() }),
      ...(fundingTxid && { fundingTxid }),
      ...(fundingVout && { fundingVout }),
      ...(genesisTxid && { genesisTxid }),
      ...(revealTxid && { revealTxid }),
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
      pk: id,
      sk: "collection",
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
      meta: excludePrimaryKeys(meta) as T,
    };
  }

  private fromFundingDb<T extends Record<string, any>>({
    id,
    address,
    collectionId,
    contentIds,
    network,
    status,
    fundingTxid,
    fundingVout,
    genesisTxid,
    revealTxid,
    timesChecked,
    lastChecked,
    ...meta
  }: TFundingDb<T>): IAddressInscriptionModel<T> {
    return {
      address,
      contentIds,
      id: toAddressInscriptionId(id),
      network: toBitcoinNetworkName(network),
      status: status as TFundingStatus,
      timesChecked,
      ...(lastChecked && { lastChecked: new Date(lastChecked) }),
      ...(fundingTxid && { fundingTxid }),
      ...(fundingVout && { fundingVout }),
      ...(genesisTxid && { genesisTxid }),
      ...(revealTxid && { revealTxid }),
      ...(collectionId ? { collectionId: toCollectionId(collectionId) } : {}),
      meta: excludePrimaryKeys(meta) as T,
    };
  }
}
