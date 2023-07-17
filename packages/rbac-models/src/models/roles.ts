export interface IRole {
  id: string;
  name: string;
  userCount: number;
}

export class RoleModel {
  public id: string;
  public name: string;
  public userCount: number;

  constructor(id: string, name: string, userCount: number) {
    this.id = id;
    this.name = name;
    this.userCount = userCount;
  }

  public static fromJson(json: any): RoleModel {
    return new RoleModel(json.id, json.name, json.userCount);
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
      userCount: this.userCount,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: RoleModel): boolean {
    return (
      this.id === other.id &&
      this.name === other.name &&
      this.userCount === other.userCount
    );
  }

  public clone(): RoleModel {
    return new RoleModel(this.id, this.name, this.userCount);
  }
}

export interface IRoleListResponseSuccess {
  items: IRole[];
  count: number;
  page: number;
  cursor?: string;
}
