import { IRole } from "./roles";

export interface IUserRoles {
  id: string;
  address: string;
  roleId: string;
}

export class UserRolesModel {
  public id: string;
  public address: string;
  public roleId: string;

  constructor(id: string, address: string, roleId: string) {
    this.id = id;
    this.address = address;
    this.roleId = roleId;
  }

  public static fromJson(json: any): UserRolesModel {
    return new UserRolesModel(json.id, json.name, json.permissionsIds);
  }

  public toJson(): any {
    return {
      id: this.id,
      address: this.address,
      roleId: this.roleId,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: UserRolesModel): boolean {
    return this.id === other.id;
  }

  public clone(): UserRolesModel {
    return new UserRolesModel(this.id, this.address, this.roleId);
  }
}

export interface IUserRolesListRolesResponse {
  items: IRole[];
  cursor?: string;
  count: number;
  page: number;
}
