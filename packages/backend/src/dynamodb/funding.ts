import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { IFundingModel, toBitcoinNetworkName } from "@0xflick/ordinals-models";
import { IFundingDao } from "../dao/funding.js";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export interface IFundingDb {
  pk: string;
  fundingAddress: string;
  fundingAmount: number;
  fundingPrivateKey: string;
  fundingNetwork: string;
  cloudWatchEventRuleId: string;
}

export function toDb(item: IFundingModel): IFundingDb {
  return {
    pk: `FUNDING#${item.fundingEvent.address}`,
    fundingAddress: item.fundingEvent.address,
    fundingAmount: item.fundingEvent.amount,
    fundingPrivateKey: item.fundingEvent.privateKey,
    fundingNetwork: item.fundingEvent.network,
    cloudWatchEventRuleId: item.cloudWatchEventRuleId,
  };
}

export function fromDb(item: IFundingDb): IFundingModel {
  return {
    fundingEvent: {
      address: item.fundingAddress,
      amount: item.fundingAmount,
      privateKey: item.fundingPrivateKey,
      network: toBitcoinNetworkName(item.fundingNetwork),
    },
    cloudWatchEventRuleId: item.cloudWatchEventRuleId,
  };
}

export class FundingDao implements IFundingDao {
  public static TABLE_NAME = "Funding";

  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  public async createFunding(item: IFundingModel) {
    const db = toDb(item);
    await this.client.send(
      new PutCommand({
        TableName: FundingDao.TABLE_NAME,
        Item: db,
      })
    );
  }

  public async getFunding(address: string) {
    const db = await this.client.send(
      new GetCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `FUNDING#${address}`,
        },
      })
    );
    return fromDb(db.Item as IFundingDb);
  }

  public async deleteFunding(address: string) {
    await this.client.send(
      new DeleteCommand({
        TableName: FundingDao.TABLE_NAME,
        Key: {
          pk: `FUNDING#${address}`,
        },
      })
    );
  }
}
