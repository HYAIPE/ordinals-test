import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { RolePermissionsDAO } from "./rolePermissions.js";
import { IRolePermission } from "../models/rolePermissions.js";
import { EActions, EResource } from "../models/permissions.js";

describe("#RolePermissions DAO", () => {
  it("can create a role permission", async () => {
    const roleId = createUuid();
    const db = getDb();
    const rolePermissionsDao = new RolePermissionsDAO(db as any);
    await rolePermissionsDao.bind({
      roleId,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });
    const role = await rolePermissionsDao.get({
      roleId,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });
    expect(role).toBeDefined();
    expect(role!.roleId).toBe(roleId);
    expect(role!.action).toBe(EActions.DELETE);
    expect(role!.resource).toBe(EResource.PRESALE);
  });

  it("can add a permissions to an existing role", async () => {
    const roleId = createUuid();
    const db = getDb();
    const permissionsDao = new RolePermissionsDAO(db as any);
    await permissionsDao.bind({
      roleId,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });
    await permissionsDao.bind({
      roleId,
      action: EActions.DELETE,
      resource: EResource.USER,
    });
    await permissionsDao.bind({
      roleId,
      action: EActions.GET,
      resource: EResource.PERMISSION,
    });
    const permissions: IRolePermission[] = [];
    for await (const p of permissionsDao.getPermissions(roleId)) {
      permissions.push(p);
    }
    expect(permissions).toBeDefined();
    expect(permissions!.length).toBe(3);
    expect(permissions).toEqual([
      {
        roleId,
        action: EActions.DELETE,
        resource: EResource.PRESALE,
      },
      {
        roleId,
        action: EActions.DELETE,
        resource: EResource.USER,
      },
      {
        roleId,
        action: EActions.GET,
        resource: EResource.PERMISSION,
      },
    ]);
  });

  it("can get batch roles", async () => {
    const roleId1 = createUuid();
    const roleId2 = createUuid();
    const db = getDb();
    const dao = new RolePermissionsDAO(db as any);
    await dao.bind({
      roleId: roleId1,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });
    await dao.bind({
      roleId: roleId2,
      action: EActions.DELETE,
      resource: EResource.USER,
    });
    await dao.bind({
      roleId: roleId2,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const permissions: IRolePermission[] = [];
    for await (const p of dao.getPermissions(roleId2)) {
      permissions.push(p);
    }
    expect(permissions).toBeDefined();
    expect(permissions!.length).toBe(2);
    expect(permissions).toEqual([
      {
        action: EActions.DELETE,
        resource: EResource.USER,
        roleId: roleId2,
      },
      {
        action: EActions.DELETE,
        resource: EResource.PRESALE,
        roleId: roleId2,
      },
    ]);
  });
});
