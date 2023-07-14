import { EActions, EResource } from "./permissions.js";

export interface IRolePermission {
  roleId: string;
  action: EActions;
  resource: EResource;
  identifier?: string;
}

export class RolePermissionModel {
  public roleId: string;
  public action: EActions;
  public resource: EResource;
  public identifier?: string;

  constructor(
    id: string,
    action: EActions,
    resource: EResource,
    identifier?: string
  ) {
    this.roleId = id;
    this.action = action;
    this.resource = resource;
    this.identifier = identifier;
  }

  public static fromJson(json: any): RolePermissionModel {
    return new RolePermissionModel(
      json.roleId,
      json.action,
      json.resource,
      json.identifier
    );
  }

  public toJson(): any {
    return {
      roleId: this.roleId,
      action: this.action,
      resource: this.resource,
      identifier: this.identifier,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: RolePermissionModel): boolean {
    return (
      this.roleId === other.roleId &&
      this.action === other.action &&
      this.resource === other.resource &&
      this.identifier === other.identifier
    );
  }

  public clone(): RolePermissionModel {
    return new RolePermissionModel(
      this.roleId,
      this.action,
      this.resource,
      this.identifier
    );
  }
}

export type TRolePermissionsListResponseSuccess = Omit<
  IRolePermission,
  "roleId"
>[];

export interface IRolePermissionsListAddressesResponseSuccess {
  items: string[];
  cursor?: string;
  count: number;
  page: number;
}

export interface IRolePermissionsAddResponseSuccess {
  id: string;
}
