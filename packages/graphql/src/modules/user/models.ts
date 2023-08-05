import { UserRolesDAO, UserWithRolesModel } from "@0xflick/ordinals-rbac";
export class Web3UserModel {
  public readonly address: string;
  public readonly token?: string;

  constructor(address: string, token?: string) {
    this.address = address;
    this.token = token;
  }

  private _promiseUserRoles: Promise<UserWithRolesModel> | null = null;
  private async prime({ userRolesDao }: { userRolesDao: UserRolesDAO }) {
    if (this._promiseUserRoles === null) {
      this._promiseUserRoles = Promise.resolve().then(async () => {
        const roleIds: string[] = [];
        for await (const roleId of userRolesDao.getRoleIds(this.address)) {
          roleIds.push(roleId);
        }
        return new UserWithRolesModel({
          address: this.address,
          roleIds,
        });
      });
    }
    return this._promiseUserRoles;
  }

  public async withRoles({ userRolesDao }: { userRolesDao: UserRolesDAO }) {
    return await this.prime({ userRolesDao });
  }
}

export class Web3LoginUserModel {
  public readonly address: string;
  public readonly token: string;
  public readonly user: Web3UserModel;

  constructor({ address, token }: { address: string; token: string }) {
    this.address = address;
    this.token = token;
    this.user = new Web3UserModel(address);
  }
}
