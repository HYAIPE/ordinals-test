import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  createLogger,
  decodeCursor,
  encodeCursor,
  paginate,
  IPaginatedResult,
  IPaginationOptions,
} from "@0xflick/ordinals-backend";
import { RolesDAO } from "./roles.js";

const logger = createLogger({
  name: "db/userRoles",
});

export class UserRolesDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_RBAC || "RBAC";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public static idFor(address: string, roleId: string) {
    return `ADDRESS#${address}ROLE_ID#${roleId}`;
  }

  public async bind({
    address,
    roleId,
    rolesDao,
  }: {
    address: string;
    roleId: string;
    rolesDao: RolesDAO;
  }): Promise<UserRolesDAO> {
    let wasBound = true;
    try {
      await this.db.send(
        new PutCommand({
          TableName: UserRolesDAO.TABLE_NAME,
          Item: {
            pk: UserRolesDAO.idFor(address, roleId),
            Address: address,
            UserRoleID: roleId,
            CreatedAt: Date.now(),
          },
          ConditionExpression: "attribute_not_exists(pk)",
        })
      );
    } catch (e: unknown) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("UserRolesDAO.bind: Duplicate entry", {
          address,
          roleId,
        });
        // Duplicate entry, whatever. continue but don't update any counters
        wasBound = false;
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }
    if (wasBound) {
      await rolesDao.usersBound(roleId);
    }
    return this;
  }

  public async unlink({
    address,
    roleId,
    rolesDao,
  }: {
    address: string;
    roleId: string;
    rolesDao: RolesDAO;
  }): Promise<UserRolesDAO> {
    let wasRemoved = true;
    try {
      await this.db.send(
        new DeleteCommand({
          TableName: UserRolesDAO.TABLE_NAME,
          Key: {
            pk: UserRolesDAO.idFor(address, roleId),
          },
          ConditionExpression: "attribute_exists(pk)",
        })
      );
    } catch (e) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("UserRolesDAO.bind: Already deleted", {
          address,
          roleId,
        });
        // Entry already gone... whatever. continue but don't update any counters
        wasRemoved = false;
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }
    if (wasRemoved) {
      await rolesDao.usersRemoved(roleId);
    }
    return this;
  }

  public async batchUnlinkByRoleId(roleId: string): Promise<UserRolesDAO> {
    const entriesToDeleteIds: { address: string; userRoleId: string }[] = [];
    for await (const item of paginate<{
      address: string;
      userRoleId: string;
    }>(async (options: IPaginationOptions) => {
      const pagination = decodeCursor(options?.cursor);
      const result = await this.db.send(
        new QueryCommand({
          TableName: UserRolesDAO.TABLE_NAME,
          IndexName: "UserRoleIDIndex",
          KeyConditionExpression: "UserRoleID = :roleId",
          ExpressionAttributeValues: {
            ":roleId": roleId,
          },
          ProjectionExpression: "UserRoleID, Address",
          ...(pagination
            ? {
                ExclusiveStartKey: pagination.lastEvaluatedKey,
              }
            : {}),
        })
      );
      const lastEvaluatedKey = result.LastEvaluatedKey;
      const page = pagination ? pagination.page + 1 : 1;
      const size = result.Items?.length ?? 0;
      const count = (pagination ? pagination.count : 0) + size;
      const cursor = encodeCursor({ lastEvaluatedKey, page, count });
      return {
        items:
          result.Items?.map((item) => ({
            address: item.Address,
            userRoleId: item.UserRoleID,
          })) ?? [],
        cursor,
        page,
        count,
        size,
      };
    })) {
      entriesToDeleteIds.push(item);
    }
    if (entriesToDeleteIds.length > 0) {
      await this.db.send(
        new BatchWriteCommand({
          RequestItems: {
            [UserRolesDAO.TABLE_NAME]: entriesToDeleteIds.map(
              ({ address, userRoleId }) => ({
                DeleteRequest: {
                  Key: {
                    pk: UserRolesDAO.idFor(address, userRoleId),
                  },
                },
              })
            ),
          },
        })
      );
    }

    return this;
  }

  public async getRoleIdsPaginated(
    address: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<string>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new QueryCommand({
        TableName: UserRolesDAO.TABLE_NAME,
        IndexName: "AddressIndex",
        KeyConditionExpression: "Address = :address",
        ExpressionAttributeValues: {
          ":address": address,
        },
        ProjectionExpression: "UserRoleID",
        ScanIndexForward: true,
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
      })
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;
    const cursor = encodeCursor({ lastEvaluatedKey, page, count });
    return {
      items: result.Items?.map((item) => item.UserRoleID) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }

  public async getAllRoleIds(address: string) {
    const roleIds: string[] = [];
    for await (const roleId of this.getRoleIds(address)) {
      roleIds.push(roleId);
    }
    return roleIds;
  }

  public getRoleIds(address: string) {
    return paginate((options) => this.getRoleIdsPaginated(address, options));
  }

  public async getAddressesPaginated(
    roleId: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<string>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new QueryCommand({
        TableName: UserRolesDAO.TABLE_NAME,
        IndexName: "UserRoleIDIndex",
        KeyConditionExpression: "UserRoleID = :roleId",
        ExpressionAttributeValues: {
          ":roleId": roleId,
        },
        ProjectionExpression: "Address",
        ScanIndexForward: true,
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
      })
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;
    const cursor = encodeCursor({ lastEvaluatedKey, page, count });
    return {
      items: result.Items?.map((item) => item.Address) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }

  public getAddresses(roleId: string) {
    return paginate<string>((options) =>
      this.getAddressesPaginated(roleId, options)
    );
  }

  public async getAllAddresses(roleId: string) {
    const addresses: string[] = [];
    for await (const address of this.getAddresses(roleId)) {
      addresses.push(address);
    }
    return addresses;
  }
}
