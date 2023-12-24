import {
  IOpenEditionClaim,
  IPaginatedResult,
  IPaginationOptions,
  decodeCursor,
  encodeCursor,
  paginate,
} from "@0xflick/ordinals-models";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export interface IDBOpenClaim {
  pk: string;
  sk: string;
  gsi1pk: string;
  DestinationAddress: string;
  Index: number;
  FundingId: string;
  CollectionId: string;
}

function toPk({
  destinationAddress,
  index,
}: {
  destinationAddress: string;
  index: number;
}) {
  return `${destinationAddress}#${index}`;
}

function toSk({ destinationAddress }: { destinationAddress: string }) {
  return destinationAddress;
}

function toGSI1PK({ collectionId }: { collectionId: string }) {
  return `${collectionId}`;
}

function toDB(input: IOpenEditionClaim): IDBOpenClaim {
  return {
    pk: toPk(input),
    sk: toSk(input),
    gsi1pk: toGSI1PK(input),
    DestinationAddress: input.destinationAddress,
    Index: input.index,
    FundingId: input.fundingId,
    CollectionId: input.collectionId,
  };
}

function toModel(input: IDBOpenClaim): IOpenEditionClaim {
  return {
    destinationAddress: input.DestinationAddress,
    index: input.Index,
    fundingId: input.FundingId,
    collectionId: input.CollectionId,
  };
}

export class OpenEditionClaimsDao {
  public static TABLE_NAME = "OpenEditionClaims";

  private client: DynamoDBClient;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  public async get({
    destinationAddress,
    index,
  }: {
    destinationAddress: string;
    index: number;
  }) {
    const response = await this.client.send(
      new GetCommand({
        TableName: OpenEditionClaimsDao.TABLE_NAME,
        Key: {
          pk: toPk({
            destinationAddress,
            index,
          }),
          sk: toSk({ destinationAddress }),
        },
      }),
    );
    return response.Item ? toModel(response.Item as IDBOpenClaim) : null;
  }

  public async put(input: IOpenEditionClaim) {
    await this.client.send(
      new PutCommand({
        TableName: OpenEditionClaimsDao.TABLE_NAME,
        Item: toDB(input),
      }),
    );
  }

  public async putBatch(input: IOpenEditionClaim[]) {
    if (input.length === 0) {
      return;
    }
    await this.client.send(
      new BatchWriteCommand({
        RequestItems: {
          [OpenEditionClaimsDao.TABLE_NAME]: input.map((i) => ({
            PutRequest: {
              Item: toDB(i),
            },
          })),
        },
      }),
    );
  }

  async getAllClaimsForAddressAndCollectionId({
    destinationAddress,
    collectionId,
  }: {
    destinationAddress: `0x${string}`;
    collectionId: string;
  }) {
    const claims: IOpenEditionClaim[] = [];
    for await (const claim of this.listAllClaimsForAddressAndCollectionId({
      destinationAddress,
      collectionId,
    })) {
      claims.push(claim);
    }
    return claims;
  }

  listAllClaimsForAddressAndCollectionId({
    destinationAddress,
    collectionId,
  }: {
    destinationAddress: `0x${string}`;
    collectionId: string;
  }) {
    return paginate((options) =>
      this.listAllClaimsPaginatedForAddressAndCollectionId({
        ...options,
        destinationAddress,
        collectionId,
      }),
    );
  }

  async listAllClaimsPaginatedForAddressAndCollectionId({
    destinationAddress,
    collectionId,
    limit,
    cursor,
  }: {
    destinationAddress: `0x${string}`;
    collectionId: string;
  } & IPaginationOptions): Promise<IPaginatedResult<IOpenEditionClaim>> {
    const pagination = decodeCursor(cursor);
    const result = await this.client.send(
      new QueryCommand({
        TableName: OpenEditionClaimsDao.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "gsi1pk = :gsi1pk AND sk = :sk",
        ExpressionAttributeValues: {
          ":gsi1pk": toGSI1PK({ collectionId }),
          ":sk": toSk({ destinationAddress }),
        },
        ...(pagination && { ExclusiveStartKey: pagination.lastEvaluatedKey }),
        ...(limit && { Limit: limit }),
      }),
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;

    return {
      items: result.Items?.map((m) => toModel(m as IDBOpenClaim)) ?? [],
      cursor: encodeCursor({
        lastEvaluatedKey,
        page,
        count,
      }),
      page,
      count,
      size,
    };
  }
}
