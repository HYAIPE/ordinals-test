import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { UserRolesDAO } from "./userRoles.js";
import { RolesDAO } from "./roles.js";

describe("#UserRoles DAO", () => {
  it("should create a role binding", async () => {
    const address = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address, roleId, rolesDao });
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([address]);
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles).toEqual([roleId]);
  });

  it("can unlink a role binding", async () => {
    const address = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address, roleId, rolesDao });
    // Check userCount
    let role = await rolesDao.get(roleId);
    expect(role).toBeDefined();
    expect(role!.userCount).toBe(1);
    await dao.unlink({ address, roleId, rolesDao });
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([]);
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles).toEqual([]);
    // Check userCount
    role = await rolesDao.get(roleId);
    expect(role).toBeDefined();
    expect(role!.userCount).toBe(0);
  });

  it("can get all addresses for a role", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address: address1, roleId, rolesDao });
    await dao.bind({ address: address2, roleId, rolesDao });
    // Wait for consistency
    await new Promise((resolve) => setTimeout(resolve, 100));
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([address1, address2]);
  });

  it("can get all roles for an address", async () => {
    const address = createUuid();
    const roleId1 = createUuid();
    const roleId2 = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId1,
      name: "test1",
    });
    await rolesDao.create({
      id: roleId2,
      name: "test2",
    });
    await dao.bind({ address, roleId: roleId1, rolesDao });
    await dao.bind({ address, roleId: roleId2, rolesDao });
    // Wait for consistency
    await new Promise((resolve) => setTimeout(resolve, 100));
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles.length).toBe(2);
    expect(roles).toEqual([roleId1, roleId2]);
    // Check the usercount for each role
    const role1 = await rolesDao.get(roleId1);
    expect(role1?.userCount).toBe(1);
    const role2 = await rolesDao.get(roleId2);
    expect(role2?.userCount).toBe(1);
  });

  it("can batch unlink", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address: address1, roleId, rolesDao });
    await dao.bind({ address: address2, roleId, rolesDao });
    await dao.batchUnlinkByRoleId(roleId);
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([]);
  });

  it("does not increment an already bound role", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address: address1, roleId, rolesDao });
    // expect a single userCount
    let role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(1);
    // Second bind throws no error and doesn't increment
    await dao.bind({ address: address1, roleId, rolesDao });
    // expect a single userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(1);

    // Do it again with a different address
    await dao.bind({ address: address2, roleId, rolesDao });
    // expect deux userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(2);
    await dao.bind({ address: address2, roleId, rolesDao });
    // expect deux userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(2);
  });

  it("does not decrement an already unbound role", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db as any);
    const rolesDao = new RolesDAO(db as any);
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await dao.bind({ address: address1, roleId, rolesDao });
    await dao.bind({ address: address2, roleId, rolesDao });

    await dao.unlink({ address: address1, roleId, rolesDao });
    // expect a single userCount
    let role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(1);
    // Second bind throws no error and doesn't increment
    await dao.unlink({ address: address1, roleId, rolesDao });
    // expect a single userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(1);

    // Do it again with a different address
    await dao.unlink({ address: address2, roleId, rolesDao });
    // expect zero userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(0);
    await dao.unlink({ address: address2, roleId, rolesDao });
    // expect zero userCount
    role = await rolesDao.get(roleId);
    expect(role!.userCount).toBe(0);
  });
});
