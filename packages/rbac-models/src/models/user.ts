import { importSPKI, JWTPayload, jwtVerify, KeyLike } from "jose";
import { generateRolesFromIds, namespacedClaim, TokenModel } from "./token.js";

export interface INonceRequest {
  address: string;
  domain: string;
  nonce: string;
  uri: string;
  expiresAt: string;
  issuedAt: string;
  version?: string;
  chainId?: number;
}

export interface IUser {
  address: string;
  nonce?: string;
}

export interface IUserWithRoles {
  address: string;
  roleIds: string[];
  nonceClaim?: string;
  decodedToken?: JWTPayload;
}

export class UserTokenExpiredError extends Error {
  constructor() {
    super("User token has expired");
  }
}

export class UserTokenNoAddressError extends Error {
  constructor() {
    super("User token has no address");
  }
}

export class UserTokenNoNonceError extends Error {
  constructor() {
    super("User token has no nonce");
  }
}

export class UserTokenIssuerMismatchError extends Error {
  constructor() {
    super("User token issuer does not match");
  }
}

export class UserTokenRolesMismatchError extends Error {
  constructor() {
    super("User token roles does not match");
  }
}

/**
 *
 * @param token
 * @param roleIds
 * @param nonce
 * @returns {Promise<UserWithRolesModel>}
 * @throws UserTokenExpiredError | UserTokenNoAddressError | UserTokenNoNonceError | UserTokenIssuerMismatchError | UserTokenRolesMismatchError
 */
export async function verifyJwtToken({
  token,
  roleIds,
  nonce,
  payload,
  issuer,
}: {
  token: string;
  roleIds?: string[];
  nonce?: string;
  payload?: JWTPayload;
  issuer: string;
}): Promise<UserWithRolesModel> {
  const result = await jwtVerify(token, await promisePublicKey, {
    ...payload,
    ...generateRolesFromIds({
      roles: roleIds,
      issuer,
    }),
    ...(typeof nonce === "string"
      ? {
          [namespacedClaim("nonce", issuer)]: nonce,
        }
      : {}),
    issuer,
  });

  const address = result.payload.sub;
  if (!address) {
    throw new UserTokenNoAddressError();
  }
  const roleNamespace = namespacedClaim("role/", issuer);
  const roleIdsFromToken = Object.entries(result.payload)
    .filter(([k, v]) => v && k.includes(roleNamespace))
    .map(([k]) => k.replace(roleNamespace, ""));

  if (roleIds && roleIdsFromToken.length !== roleIds?.length) {
    throw new UserTokenRolesMismatchError();
  }
  for (const roleId of roleIdsFromToken) {
    if (roleIds && !roleIds.includes(roleId)) {
      throw new UserTokenRolesMismatchError();
    }
  }

  const expired =
    result.payload.exp && result.payload.exp * 1000 - Date.now() < 0;
  if (expired && result.payload.exp) {
    console.log("expiration on token", result.payload.exp * 1000, Date.now());
    throw new UserTokenExpiredError();
  }
  const nonceClaim = result.payload[namespacedClaim("nonce", issuer)] as string;
  if (typeof nonceClaim === "undefined") {
    throw new UserTokenNoNonceError();
  }
  return new UserWithRolesModel({
    address,
    roleIds: roleIdsFromToken,
    nonce,
    nonceClaim,
    decodedToken: result.payload,
  });
}

export class UserModel implements IUser {
  public readonly address: string;
  public readonly nonce?: string;

  constructor(obj: IUser) {
    this.address = obj.address;
    this.nonce = obj.nonce;
  }

  public fromPartial(partial: Partial<IUser>): UserModel {
    return UserModel.fromJson({
      ...this.toJson(),
      ...partial,
    });
  }

  public static fromJson(json: any): UserModel {
    return new UserModel({
      address: json.address,
      nonce: json.nonce,
    });
  }

  public toJson(): IUser {
    return {
      address: this.address,
      nonce: this.nonce,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: UserModel): boolean {
    return this.address === other.address && this.nonce === other.nonce;
  }

  public clone(): UserModel {
    return new UserModel(this.toJson());
  }

  public static fromString(str: string): UserModel {
    return UserModel.fromJson(JSON.parse(str));
  }
}

export class UserWithRolesModel implements IUserWithRoles, IUser {
  public readonly nonceClaim?: string;
  public roleIds: string[];

  public decodedToken?: JWTPayload;

  public get address(): string {
    return this._user.address;
  }

  private _user: UserModel;

  constructor(obj: IUserWithRoles & IUser & { decodedToken?: JWTPayload }) {
    this._user = UserModel.fromJson(obj);
    this.roleIds = obj.roleIds;
    this.nonceClaim = obj.nonceClaim;
    this.decodedToken = obj.decodedToken;
  }

  public get nonce(): string | undefined {
    return this._user.nonce;
  }

  public hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  public fromPartial(partial: Partial<IUserWithRoles>): UserWithRolesModel {
    return new UserWithRolesModel({
      ...this.toJson(),
      ...partial,
    });
  }

  public static fromJson(json: any): UserWithRolesModel {
    return new UserWithRolesModel({
      address: json.address,
      roleIds: json.roleIds,
      decodedToken: json.decodedToken,
      nonceClaim: json.nonceClaim,
      nonce: json.nonce,
    });
  }

  public toJson(): IUserWithRoles {
    return {
      address: this.address,
      roleIds: this.roleIds,
      nonceClaim: this.nonceClaim,
      decodedToken: this.decodedToken,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export const promisePublicKey = new Promise<KeyLike>(
  async (resolve, reject) => {
    if ((global as any).promisePrivateKeys) {
      await (global as any).promisePrivateKeys;
    }
    if (!process.env.AUTH_MESSAGE_PUBLIC_KEY) {
      resolve("" as any);
    }
    importSPKI(process.env.AUTH_MESSAGE_PUBLIC_KEY ?? "", "ECDH-ES+A128KW", {
      extractable: true,
    }).then(resolve, reject);
  },
);
