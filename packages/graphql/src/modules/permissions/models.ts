import {
  RolePermissionsDAO,
  RolesDAO,
  IRole,
  IRolePermission,
} from "@0xflick/ordinals-rbac";

export class RoleModel {
  private roleId: string;
  private roleDao: RolesDAO;
  private rolePermissionsDao: RolePermissionsDAO;
  private role: IRole | null = null;
  private rolePermissions: IRolePermission[] | null = null;

  constructor(
    roleDao: RolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    roleId: string,
    role: IRole | null = null
  ) {
    this.roleId = roleId;
    this.roleDao = roleDao;
    this.rolePermissionsDao = rolePermissionsDao;
    this.role = role;
  }

  private _promiseLoaded: Promise<unknown> | null = null;
  private async prime() {
    if (this._promiseLoaded !== null) {
      this._promiseLoaded = Promise.all([
        Promise.resolve().then(async () => {
          if (this.role === null) {
            this.role = await this.roleDao.get(this.roleId);
          }
        }),
        Promise.resolve().then(async () => {
          if (this.rolePermissions === null) {
            this.rolePermissions =
              await this.rolePermissionsDao.getAllPermissions(this.roleId);
          }
        }),
      ]);
      await this._promiseLoaded;
    }
    return this._promiseLoaded;
  }

  get id() {
    return this.roleId;
  }

  async name() {
    await this.prime();
    return this.role?.name;
  }

  async userCount() {
    await this.prime();
    return this.role?.userCount;
  }

  async permissions() {
    await this.prime();
    return this.rolePermissions;
  }
}
