import { PermissionsModule } from "./generated-types/module-types.js";
import { graphqlPermissionToModel } from "./transforms.js";
import { Web3UserModel } from "../user/models.js";
import { RoleModel } from "./models.js";

export const resolvers: PermissionsModule.Resolvers = {
  MutationRBAC: {
    createRole: async (
      _,
      { name, permissions },
      { rolePermissionsDao, rolesDao },
    ) => {
      const role = await rolesDao.create({
        name,
      });
      if (permissions && permissions.length > 0) {
        await rolePermissionsDao.batchBind({
          roleId: role.id,
          permissions: permissions.map(graphqlPermissionToModel),
        });
      }
      return new RoleModel(rolesDao, rolePermissionsDao, role.id, role);
    },
  },
  Role: {
    addPermissions: async (role, { permissions }, { rolePermissionsDao }) => {
      await rolePermissionsDao.batchBind({
        roleId: role.id,
        permissions: permissions.map(graphqlPermissionToModel),
      });
      return role;
    },
    bindToUser: async ({ id }, { userAddress }, { userRolesDao, rolesDao }) => {
      await userRolesDao.bind({
        roleId: id,
        address: userAddress,
        rolesDao,
      });
      return new Web3UserModel(userAddress);
    },
    removePermissions: async (
      role,
      { permissions },
      { rolePermissionsDao },
    ) => {
      await rolePermissionsDao.batchUnlink({
        roleId: role.id,
        permissions: permissions.map(graphqlPermissionToModel),
      });
      return role;
    },
    unbindFromUser: async (
      { id },
      { userAddress },
      { userRolesDao, rolesDao },
    ) => {
      await userRolesDao.unlink({
        roleId: id,
        address: userAddress,
        rolesDao,
      });
      return new Web3UserModel(userAddress);
    },
    delete: async (
      { id },
      _,
      { rolesDao, userRolesDao, rolePermissionsDao },
    ) => {
      await rolesDao.deleteRole(userRolesDao, rolePermissionsDao, id);
      return true;
    },
  },
};
