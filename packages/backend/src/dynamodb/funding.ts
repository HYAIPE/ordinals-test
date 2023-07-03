import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  IAddressInscriptionModel,
  toAddressInscriptionId,
  toCollectionId,
  ICollectionModel,
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

export interface IFundingDb {
  pk: string;
  id: string;
  address: string;
  network: string;
  contentIds: string[];
  collectionId: string;
}

export interface IFundingCollectionDb {
  pk: string;
  collectionId: string;
  collectionName: string;
  maxSupply: number;
  totalCount: number;
}

export function toFundingDb({
  address,
  contentIds,
  collectionId,
  id,
  network,
}: IAddressInscriptionModel): IFundingDb {
  return {
    pk: `FUNDING#${id}`,
    id,
    address,
    collectionId,
    contentIds,
    network,
  };
}
export function toCollectionDb({
  id,
  maxSupply,
  totalCount,
  name,
}: ICollectionModel): IFundingCollectionDb {
  return {
    pk: `COLLECTION#${id}`,
    maxSupply,
    totalCount,
    collectionName: name,
    collectionId: id,
  };
}

export function fromFundingDb(item: IFundingDb): IAddressInscriptionModel {
  return {
    address: item.address,
    contentIds: item.contentIds,
    id: toAddressInscriptionId(item.id),
    network: toBitcoinNetworkName(item.network),
    collectionId: toCollectionId(item.collectionId),
  };
}

export function fromCollectionDb(item: IFundingCollectionDb): ICollectionModel {
  return {
    id: toCollectionId(item.collectionId),
    maxSupply: item.maxSupply,
    name: item.collectionName,
    totalCount: item.totalCount,
  };
}

export class FundingDao implements IFundingDao {
  public static TABLE_NAME = "Funding";

  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  public async createFunding(item: IAddressInscriptionModel) {
    const db = toFundingDb(item);
    await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
      })
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
    return fromFundingDb(db.Item as IFundingDb);
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

  public async createCollection(item: ICollectionModel) {
    const db = toCollectionDb(item);
    await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
      })
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
    return fromCollectionDb(db.Item as IFundingCollectionDb);
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
}
