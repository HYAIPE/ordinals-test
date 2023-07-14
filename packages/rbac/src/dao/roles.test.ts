import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { RolesDAO } from "./roles.js";

describe("#Roles DAO", () => {
  it("should create a role", async () => {
    const roleId = createUuid();
    const db = getDb();
    const dao = new RolesDAO(db as any);
    await dao.create({
      id: roleId,
      name: "test",
    });
    const user = await dao.get(roleId);
    expect(user).toBeDefined();
    expect(user!.id).toBe(roleId);
    expect(user!.name).toBe("test");
  });

  it("roles can have permissions", async () => {
    const roleId = createUuid();
    const db = getDb();
    const dao = new RolesDAO(db as any);
    await dao.create({
      id: roleId,
      name: "test",
    });
    const role = await dao.get(roleId);
    expect(role).toBeDefined();
    expect(role!.id).toBe(roleId);
    expect(role!.name).toBe("test");
  });

  it("can get batch roles", async () => {
    const roleId1 = createUuid();
    const roleId2 = createUuid();
    const db = getDb();
    const dao = new RolesDAO(db as any);
    await dao.create({
      id: roleId1,
      name: "test",
    });
    await dao.create({
      id: roleId2,
      name: "test2",
    });
    const roles = await dao.getRoles([roleId2, roleId1]);
    expect(roles).toBeDefined();
    expect(roles.length).toBe(2);
    expect(roles).toContainEqual({
      id: roleId1,
      name: "test",
      userCount: 0,
    });
    expect(roles).toContainEqual({
      id: roleId2,
      name: "test2",
      userCount: 0,
    });
  });
});
