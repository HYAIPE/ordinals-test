import { IObservedClaim } from "@0xflick/ordinals-models";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export interface IDBObservedClaim {
  pk: string;
  sk: string;
  ContractAddress: `0x${string}`;
  ChainId: number;
  ClaimedAddress: string;
  DestinationAddress: string;
  Index: number;
  ObservedBlockHeight: number;
  FundingId?: string;
}

function toPk({
  claimedAddress,
  contractAddress,
  chainId,
  destinationAddress,
  index,
}: {
  claimedAddress: string;
  contractAddress: string;
  chainId: number;
  destinationAddress: string;
  index: number;
}) {
  return `${claimedAddress}#${contractAddress}#${chainId}#${destinationAddress}#${index}`;
}

function toSk({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: number;
}) {
  return `CLAIM#${contractAddress}#${chainId}`;
}

function toDB(input: IObservedClaim): IDBObservedClaim {
  return {
    pk: toPk(input),
    sk: toSk(input),
    ContractAddress: input.contractAddress,
    ChainId: input.chainId,
    ClaimedAddress: input.claimedAddress,
    DestinationAddress: input.destinationAddress,
    Index: input.index,
    ObservedBlockHeight: input.observedBlockHeight,
    ...(input.fundingId && { FundingId: input.fundingId }),
  };
}

function toModel(input: IDBObservedClaim): IObservedClaim {
  return {
    contractAddress: input.ContractAddress as `0x${string}`,
    chainId: input.ChainId,
    claimedAddress: input.ClaimedAddress as `0x${string}`,
    destinationAddress: input.DestinationAddress,
    index: input.Index,
    observedBlockHeight: input.ObservedBlockHeight,
    fundingId: input.FundingId,
  };
}

export class ClaimsDao {
  public static TABLE_NAME = "ObservedClaims";

  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  public async get({
    contractAddress,
    chainId,
    claimedAddress,
    destinationAddress,
    index,
  }: {
    contractAddress: `0x${string}`;
    chainId: number;
    claimedAddress: `0x${string}`;
    destinationAddress: string;
    index: number;
  }) {
    const response = await this.client.send(
      new GetCommand({
        TableName: ClaimsDao.TABLE_NAME,
        Key: {
          pk: toPk({
            claimedAddress,
            contractAddress,
            chainId,
            destinationAddress,
            index,
          }),
          sk: toSk({ contractAddress, chainId }),
        },
      })
    );
    return response.Item ? toModel(response.Item as IDBObservedClaim) : null;
  }

  public async put(input: IObservedClaim) {
    await this.client.send(
      new PutCommand({
        TableName: ClaimsDao.TABLE_NAME,
        Item: toDB(input),
      })
    );
  }

  public async getClaimedEventsForBlockHeight({
    blockHeightBegin,
    blockHeightEnd,
  }: {
    blockHeightBegin: number;
    blockHeightEnd: number;
  }) {
    const response = await this.client.send(
      new QueryCommand({
        TableName: ClaimsDao.TABLE_NAME,
        IndexName: "ObservedBlockHeight-index",
        KeyConditionExpression: "ObservedBlockHeight BETWEEN :begin AND :end",
        ExpressionAttributeValues: {
          ":begin": blockHeightBegin,
          ":end": blockHeightEnd,
        },
      })
    );
    return response.Items?.map((m) => toModel(m as IDBObservedClaim)) ?? [];
  }

  public async getLastObservedBlockHeight({
    contractAddress,
    chainId,
  }: {
    contractAddress: string;
    chainId: number;
  }) {
    const response = await this.client.send(
      new GetCommand({
        TableName: ClaimsDao.TABLE_NAME,
        Key: {
          pk: toSk({ contractAddress, chainId }),
          sk: "LAST_OBSERVED_BLOCK_HEIGHT",
        },
        AttributesToGet: ["ObservedBlockHeight"],
      })
    );
    if (!response.Item) {
      return null;
    }
    return (response.Item as IDBObservedClaim).ObservedBlockHeight;
  }

  public async batchGetLastObservedBlockHeight({
    observedContracts,
  }: {
    observedContracts: {
      contractAddress: string;
      chainId: number;
    }[];
  }) {
    const response = await this.client.send(
      new BatchGetCommand({
        RequestItems: {
          [ClaimsDao.TABLE_NAME]: {
            Keys: observedContracts.map((oc) => ({
              pk: toSk(oc),
              sk: "LAST_OBSERVED_BLOCK_HEIGHT",
            })),
            ProjectionExpression:
              "ObservedBlockHeight, ChainId, ContractAddress",
          },
        },
      })
    );
    const items = response.Responses?.[ClaimsDao.TABLE_NAME];
    if (!items) {
      return [];
    }
    return (items as IDBObservedClaim[]).map(
      ({
        ContractAddress: contractAddress,
        ChainId: chainId,
        ObservedBlockHeight: observedBlockHeight,
      }: IDBObservedClaim) => ({
        contractAddress,
        chainId,
        observedBlockHeight,
      })
    );
  }

  public async batchUpdateObservedClaims({
    observedClaims,
  }: {
    observedClaims: IObservedClaim[];
  }) {
    const observedContracts = new Map<
      string,
      {
        contractAddress: `0x${string}`;
        chainId: number;
        maxBlockHeight: number;
      }
    >();
    for (const oc of observedClaims) {
      const key = toSk(oc);
      if (!observedContracts.has(key)) {
        observedContracts.set(key, {
          contractAddress: oc.contractAddress,
          chainId: oc.chainId,
          maxBlockHeight: oc.observedBlockHeight, // Use observedBlockHeight here initially
        });
      } else {
        const observedContract = observedContracts.get(key);
        if (observedContract) {
          observedContract.maxBlockHeight = Math.max(
            observedContract.maxBlockHeight,
            oc.observedBlockHeight
          );
        }
      }
    }

    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [ClaimsDao.TABLE_NAME]: [
            ...observedClaims.map((oc) => ({
              PutRequest: {
                Item: toDB(oc),
              },
            })),
            ...Array.from(observedContracts.values()).map((oc) => ({
              PutRequest: {
                Item: {
                  pk: toSk(oc),
                  sk: "LAST_OBSERVED_BLOCK_HEIGHT",
                  ContractAddress: oc.contractAddress,
                  ChainId: oc.chainId,
                  ObservedBlockHeight: oc.maxBlockHeight,
                },
              },
            })),
          ],
        },
      })
    );
  }

  public async updateLastObserved({
    contractAddress,
    chainId,
    observedBlockHeight,
  }: {
    contractAddress: string;
    chainId: number;
    observedBlockHeight: number;
  }) {
    await this.client.send(
      new PutCommand({
        TableName: ClaimsDao.TABLE_NAME,
        Item: {
          pk: toSk({
            contractAddress,
            chainId,
          }),
          sk: "LAST_OBSERVED_BLOCK_HEIGHT",
          ContractAddress: contractAddress,
          ChainId: chainId,
          ObservedBlockHeight: observedBlockHeight,
        },
        ReturnValues: "NONE",
      })
    );
  }

  async getAllClaims({
    address,
    contractAddress,
    chainId,
  }: {
    address: `0x${string}`;
    contractAddress: `0x${string}`;
    chainId: number;
  }) {
    const results = await this.client.send(
      new QueryCommand({
        TableName: ClaimsDao.TABLE_NAME,
        IndexName: "ClaimsByAddress",
        KeyConditionExpression: "ClaimedAddress = :address AND sk = :sk",
        ExpressionAttributeValues: {
          ":address": address,
          ":sk": toSk({ contractAddress, chainId }),
        },
      })
    );
    return results.Items?.map((m) => toModel(m as IDBObservedClaim)) ?? [];
  }

  async batchUpdateFundingIds({
    observedClaimsWithFundingIds,
  }: {
    observedClaimsWithFundingIds: (Omit<IObservedClaim, "fundingId"> & {
      fundingId: string;
    })[];
  }) {
    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [ClaimsDao.TABLE_NAME]: observedClaimsWithFundingIds.map((oc) => ({
            PutRequest: {
              Item: toDB(oc),
            },
          })),
        },
      })
    );
  }
}
