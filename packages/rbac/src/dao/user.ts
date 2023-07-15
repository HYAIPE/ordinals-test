import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidV4 } from "uuid";
import {
  UserModel,
  IUser,
  UserWithRolesModel,
  INonceRequest,
} from "../models/index.js";
import { EActions, EResource } from "../models/permissions.js";
import { RolePermissionsDAO } from "./rolePermissions.js";
import { UserRolesDAO } from "./userRoles.js";

function toId(address: string, nonce: string) {
  return `USER#${address}NONCE#${nonce}`;
}

interface IUserDb {
  pk: string;
  sk: string;
  Address: string;
  Nonce: string;
  TTL: number;
  Domain: string;
  Uri: string;
  ExpiresAt: string;
  IssuedAt: string;
  Version?: string;
  ChainId?: number;
}

function toDb(input: INonceRequest): IUserDb {
  return {
    Address: input.address,
    Nonce: input.nonce,
    Domain: input.domain,
    Uri: input.uri,
    ExpiresAt: input.expiresAt,
    IssuedAt: input.issuedAt,
    pk: toId(input.address, input.nonce),
    sk: input.address,
    TTL: Math.floor(Date.now() / 1000) + UserDAO.TTL,
    ...(input.version && { Version: input.version }),
    ...(input.chainId && { ChainId: input.chainId }),
  };
}

function fromDb(input: IUserDb): INonceRequest {
  return {
    address: input.Address,
    nonce: input.Nonce,
    domain: input.Domain,
    expiresAt: input.ExpiresAt,
    issuedAt: input.IssuedAt,
    uri: input.Uri,
    version: input.Version,
    chainId: input.ChainId,
  };
}

export class UserDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_USER_NONCE || "UserNonce";
  public static TTL = 60 * 60 * 24 * 2; // 2 days
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create({
    nonce,
    ...request
  }: Omit<INonceRequest, "nonce"> & { nonce?: string }): Promise<string> {
    nonce = nonce ?? uuidV4();
    await this.db.send(
      new PutCommand({
        TableName: UserDAO.TABLE_NAME,
        Item: toDb({
          ...request,
          nonce,
        }),
      }),
    );
    return nonce;
  }

  public async get(
    address: string,
    nonce: string,
  ): Promise<INonceRequest | null> {
    const response = await this.db.send(
      new GetCommand({
        TableName: UserDAO.TABLE_NAME,
        Key: {
          pk: toId(address, nonce),
          sk: address,
        },
      }),
    );
    if (!response.Item) {
      return null;
    }
    return fromDb(response.Item as IUserDb);
  }

  public async validNonceForUser(address: string, nonce: string) {
    const response = await this.db.send(
      new GetCommand({
        TableName: UserDAO.TABLE_NAME,
        Key: {
          pk: toId(address, nonce),
          sk: address,
        },
      }),
    );
    if (!response.Item) {
      return false;
    }
    return true;
  }

  public async getUsersNonces(address: string): Promise<string[] | null> {
    const userRecord = await this.db.send(
      new QueryCommand({
        TableName: UserDAO.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "sk = :address",
        ExpressionAttributeValues: {
          ":address": address,
        },
      }),
    );
    if (!userRecord.Items) {
      return null;
    }
    return userRecord.Items.map((item) => item.Nonce);
  }

  public async getUserWithRoles(
    userRolesDao: UserRolesDAO,
    address: string,
  ): Promise<UserWithRolesModel> {
    // Fetch all roles
    const roleIds = await userRolesDao.getAllRoleIds(address);

    return new UserWithRolesModel({
      address,
      roleIds,
    });
  }

  public async allowedActionsForAddress(
    userRoles: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    address: string,
  ) {
    const user = await this.getUserWithRoles(userRoles, address);
    // Fetch permissions for all roles
    const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
      user.roleIds,
    );
    return permissions;
  }

  // weird function, maybe remove
  /**
   *
   * @param userRoles
   * @param rolePermissionsDao
   * @param address
   * @param possibilities
   * @returns
   * @deprecated
   */
  public async canPerformAction(
    userRoles: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    address: string,
    possibilities: [EActions, EResource][] | [EActions, EResource],
  ): Promise<[EActions, EResource] | null> {
    const permissions = await this.allowedActionsForAddress(
      userRoles,
      rolePermissionsDao,
      address,
    );
    if (!permissions) {
      return null;
    }
    const allPossibilities: [EActions, EResource][] = [];
    if (possibilities.length > 1) {
      if (Array.isArray(possibilities[0])) {
        allPossibilities.push(...(possibilities as [EActions, EResource][]));
      } else {
        allPossibilities.push(possibilities as [EActions, EResource]);
      }
    }
    for (const permission of permissions) {
      for (const [action, resource] of allPossibilities) {
        if (
          permission.action === EActions.ADMIN &&
          (permission.resource === resource || resource === EResource.ALL)
        ) {
          return [action, resource];
        }
        if (permission.action === action && permission.resource === resource) {
          return [action, resource];
        }
      }
    }
    return null;
  }
}
