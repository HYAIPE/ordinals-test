import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidV4 } from "uuid";
import { RolePermissionsDAO } from "./rolePermissions.js";
import { IRole, RoleModel } from "../models/index.js";
import { UserRolesDAO } from "./userRoles.js";
import {
  createLogger,
  decodeCursor,
  encodeCursor,
  paginate,
  IPaginatedResult,
  IPaginationOptions,
} from "@0xflick/ordinals-backend";

const logger = createLogger({
  name: "db/roles",
});

function toPk(id: string) {
  return `ROLE#${id}`;
}

export class RolesDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_ROLES || "RBAC";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(
    role: Omit<IRole, "userCount" | "id"> & { id?: string }
  ): Promise<RoleModel> {
    const id = role.id ?? uuidV4();
    try {
      await this.db.send(
        new PutCommand({
          TableName: RolesDAO.TABLE_NAME,
          Item: {
            pk: toPk(id),
            RoleID: id,
            RoleName: role.name,
            UserCount: 0,
          },
          ConditionExpression: "attribute_not_exists(ID)",
        })
      );
    } catch (e) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("RolesDao: Duplicate entry on create", role);
        // Duplicate entry, whatever. continue but don't update any counters
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }

    return new RoleModel(id, role.name, 0);
  }

  public async get(roleId: string): Promise<IRole | null> {
    const role = await this.db.send(
      new GetCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          pk: toPk(roleId),
        },
      })
    );
    if (!role.Item) {
      return null;
    }
    return {
      id: role.Item.RoleID,
      name: role.Item.RoleName,
      userCount: role.Item.UserCount || 0,
    };
  }

  public async usersBound(roleId: string, count: number = 1) {
    // Increment UserCount
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          pk: toPk(roleId),
        },
        UpdateExpression: "set UserCount = UserCount + :inc",
        ExpressionAttributeValues: {
          ":inc": count,
        },
      })
    );
    return this;
  }

  public async usersRemoved(roleId: string, count: number = 1) {
    // Decrement UserCount
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          pk: toPk(roleId),
        },
        UpdateExpression: "set UserCount = UserCount - :inc",
        ExpressionAttributeValues: {
          ":inc": count,
        },
      })
    );
    return this;
  }

  public async addPermissions(
    roleId: string,
    permissionsIds: string[]
  ): Promise<RolesDAO> {
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          pk: toPk(roleId),
        },
        UpdateExpression:
          "SET PermissionIds = list_append(PermissionIds, :permissionsIds)",
        ExpressionAttributeValues: {
          ":permissionsIds": permissionsIds,
        },
      })
    );
    return this;
  }

  public async deleteRole(
    rbacDao: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    roleId: string
  ): Promise<RolesDAO> {
    await Promise.all([
      this.db.send(
        new DeleteCommand({
          TableName: RolesDAO.TABLE_NAME,
          Key: {
            pk: toPk(roleId),
          },
        })
      ),
      rbacDao.batchUnlinkByRoleId(roleId),
      rolePermissionsDao.batchUnlinkByRoleId(roleId),
    ]);
    return this;
  }

  public async getRoles(roleIds: string[]): Promise<IRole[]> {
    const roles = await this.db.send(
      new BatchGetCommand({
        RequestItems: {
          [RolesDAO.TABLE_NAME]: {
            Keys: roleIds.map((id) => ({ pk: toPk(id) })),
            ConsistentRead: true,
          },
        },
      })
    );
    return (
      roles.Responses?.[RolesDAO.TABLE_NAME].map((role) => ({
        id: role.RoleID,
        name: role.RoleName,
        userCount: role.UserCount ?? 0,
      })) ?? []
    );
  }

  public async getRoleByName(name: string): Promise<IRole[] | null> {
    const result = await this.db.send(
      new ScanCommand({
        TableName: RolesDAO.TABLE_NAME,
        IndexName: "RolesByNameIndex",
        FilterExpression: "RoleName = :name",
        ExpressionAttributeValues: {
          ":name": name,
        },
      })
    );
    return (
      result.Items?.map((item) => ({
        id: item.RoleID,
        name: item.RoleName,
        userCount: item.UserCount ?? 0,
      })) ?? []
    );
  }

  public listAll() {
    return paginate((options) => this.listAllPaginated(options));
  }

  public async listAllPaginated(
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<RoleModel>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new ScanCommand({
        TableName: RolesDAO.TABLE_NAME,
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
      items:
        result.Items?.map(
          (item) =>
            new RoleModel(item.RoleID, item.RoleName, item.UserCount ?? 0)
        ) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }
}
