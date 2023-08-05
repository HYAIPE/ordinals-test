import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  decodeCursor,
  encodeCursor,
  paginate,
  IPaginatedResult,
  IPaginationOptions,
} from "@0xflick/ordinals-models";
import {
  EActions,
  EResource,
  IRolePermission,
  RolePermissionModel,
  TPermission,
} from "@0xflick/ordinals-rbac-models";

export class RolePermissionsDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_ROLE_PERMISSIONS || "RBAC";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public static idFor({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }) {
    return `ROLE_ID#${roleId}ACTION#${action}RSC#${resource}${
      identifier ? `ID#${identifier}` : ""
    }`;
  }

  public async bind({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new PutCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Item: {
          pk: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
          PermissionRoleID: roleId,
          ActionType: action,
          ResourceType: resource,
          CreatedAt: Date.now(),
          ...(identifier ? { Identifier: identifier } : {}),
        },
      }),
    );
    return this;
  }

  public async batchBind({
    roleId,
    permissions,
  }: {
    roleId: string;
    permissions: TPermission[];
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new BatchWriteCommand({
        RequestItems: {
          [RolePermissionsDAO.TABLE_NAME]: permissions.map((permission) => ({
            PutRequest: {
              Item: {
                pk: RolePermissionsDAO.idFor({
                  roleId,
                  action: permission.action,
                  resource: permission.resource,
                  identifier: permission.identifier,
                }),
                PermissionRoleID: roleId,
                ActionType: permission.action,
                ResourceType: permission.resource,
                CreatedAt: Date.now(),
                ...(permission.identifier
                  ? { Identifier: permission.identifier }
                  : {}),
              },
            },
          })),
        },
      }),
    );
    return this;
  }

  public async get({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<null | RolePermissionModel> {
    const role = await this.db.send(
      new GetCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Key: {
          pk: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
        },
      }),
    );
    if (!role.Item) {
      return null;
    }
    return RolePermissionModel.fromJson({
      roleId: role.Item.PermissionRoleID,
      action: role.Item.ActionType,
      resource: role.Item.ResourceType,
      identifier: role.Item.Identifier,
    });
  }

  public async batchUnlinkByRoleId(roleId: string) {
    const entitiesToDelete: string[] = [];
    for await (const entity of this.getPermissions(roleId)) {
      entitiesToDelete.push(RolePermissionsDAO.idFor(entity));
    }
    if (entitiesToDelete.length === 0) {
      return;
    }
    await this.db.send(
      new BatchWriteCommand({
        RequestItems: {
          [RolePermissionsDAO.TABLE_NAME]: entitiesToDelete.map((id) => ({
            DeleteRequest: {
              Key: {
                pk: id,
              },
            },
          })),
        },
      }),
    );
  }

  public async unlink({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new DeleteCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Key: {
          pk: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
        },
      }),
    );
    return this;
  }

  public async batchUnlink({
    roleId,
    permissions,
  }: {
    roleId: string;
    permissions: TPermission[];
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new BatchWriteCommand({
        RequestItems: {
          [RolePermissionsDAO.TABLE_NAME]: permissions.map((permission) => ({
            DeleteRequest: {
              Key: {
                pk: RolePermissionsDAO.idFor({
                  roleId,
                  action: permission.action,
                  resource: permission.resource,
                  identifier: permission.identifier,
                }),
              },
            },
          })),
        },
      }),
    );
    return this;
  }

  public async getAllPermissions(roleId: string, options?: IPaginationOptions) {
    const permissions: IRolePermission[] = [];
    for await (const p of this.getPermissions(roleId, options)) {
      permissions.push(p);
    }
    return permissions;
  }

  public getPermissions(roleId: string, options?: IPaginationOptions) {
    return paginate(async (reqOptions) => {
      return this.getPermissionsPaginated(roleId, reqOptions);
    }, options);
  }

  public async getPermissionsPaginated(
    roleId: string,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<RolePermissionModel>> {
    const pagination = decodeCursor(options?.cursor);
    const permissions = await this.db.send(
      new QueryCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        KeyConditionExpression: "PermissionRoleID = :roleId",
        IndexName: "PermissionRoleIDIndex",
        ExpressionAttributeValues: {
          ":roleId": roleId,
        },
        ProjectionExpression:
          "PermissionRoleID, ActionType, ResourceType, Identifier",
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
      }),
    );

    const lastEvaluatedKey = permissions.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = permissions.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;

    return {
      items:
        permissions.Items?.map((role) =>
          RolePermissionModel.fromJson({
            roleId: role.PermissionRoleID,
            action: role.ActionType,
            resource: role.ResourceType,
            identifier: role.Identifier,
          }),
        ) ?? [],
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

  public async findRolesWithPermission(action: EActions, resource: EResource) {
    const roles = await this.db.send(
      new ScanCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        IndexName: "RoleByActionResourceIndex",
        FilterExpression: "ActionType = :action AND ResourceType = :resource",
        ExpressionAttributeValues: {
          ":action": action,
          ":resource": resource,
        },
      }),
    );
    return (
      roles.Items?.map((role) =>
        RolePermissionModel.fromJson({
          roleId: role.PermissionRoleID,
          action: role.ActionType,
          resource: role.ResourceType,
          identifier: role.Identifier,
        }),
      ) ?? []
    );
  }

  public async allowedActionsForRoleIds(
    roleIds: string[],
  ): Promise<Omit<IRolePermission, "roleId">[]> {
    const permissions = await Promise.all(
      roleIds.map((roleId) => this.getAllPermissions(roleId)),
    );
    const permissionsMap = new Map<string, Omit<IRolePermission, "roleId">>();
    permissions.forEach((permission) => {
      permission.forEach((permission) => {
        permissionsMap.set(RolePermissionsDAO.idFor(permission), permission);
      });
    });
    return Array.from(permissionsMap.values()).map(
      ({ action, resource, identifier }) => ({
        action,
        resource,
        identifier,
      }),
    );
  }
}
