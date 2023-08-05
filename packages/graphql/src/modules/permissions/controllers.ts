import { v4 as createUuid } from "uuid";
import {
  defaultAdminStrategyAll,
  EActions,
  EResource,
  IRole,
  isActionOnResource,
} from "@0xflick/models";
import { TContext } from "../../context";
import { verifyAuthorizedUser } from "../auth/authorized";
import { GraphQLResolveInfo } from "graphql";
import { TPermission, RoleModel } from "../../models";

const canPerformBindRoleToUserAction = defaultAdminStrategyAll(
  EResource.USER_ROLE,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.USER_ROLE,
  }),
  isActionOnResource({
    action: EActions.UPDATE,
    resource: EResource.USER_ROLE,
  }),
);

export async function bindUserToRole(
  context: TContext,
  info: GraphQLResolveInfo,
  {
    userAddress,
    roleId,
  }: {
    userAddress: string;
    roleId: string;
  },
) {
  context.requireMutation(info);
  await verifyAuthorizedUser(context, canPerformBindRoleToUserAction);
  const { userDao, userRolesDao, rolesDao } = context;
  const userFromDb = await userDao.getUser(userAddress);
  const userModel =
    userFromDb ??
    (await userDao.create({
      address: userAddress,
    }));

  await userRolesDao.bind({
    address: userAddress,
    roleId: roleId,
    rolesDao,
  });
  return userModel;
}

const canPerformCreateRoleAction = defaultAdminStrategyAll(
  EResource.ROLE,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.ROLE,
  }),
);

export async function createRole(
  context: TContext,
  info: GraphQLResolveInfo,
  {
    name,
    permissions,
    skipAuth,
  }: { name: string; permissions: TPermission[]; skipAuth?: boolean },
): Promise<RoleModel> {
  context.requireMutation(info);

  if (!skipAuth) {
    await verifyAuthorizedUser(context, canPerformCreateRoleAction);
  }

  const { rolesDao, rolePermissionsDao } = context;
  const id = createUuid();
  await rolesDao.create({
    id,
    name,
  });
  await Promise.all(
    permissions.map(async (permission) => {
      await rolePermissionsDao.bind({
        roleId: id,
        ...permission,
      });
    }),
  );
  return new RoleModel(rolesDao, rolePermissionsDao, id);
}

const canPerformUnlinkRoleToUserAction = defaultAdminStrategyAll(
  EResource.USER_ROLE,
  isActionOnResource({
    action: EActions.DELETE,
    resource: EResource.USER_ROLE,
  }),
);

export async function unlinkUserFromRole(
  context: TContext,
  info: GraphQLResolveInfo,
  { userAddress, roleId }: { userAddress: string; roleId: string },
) {
  context.requireMutation(info);
  await verifyAuthorizedUser(context, canPerformUnlinkRoleToUserAction);
  const { userRolesDao, rolesDao } = context;
  await userRolesDao.unlink({
    address: userAddress,
    roleId,
    rolesDao,
  });
  return true;
}

const canPerformUListAllRoles = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.LIST,
    resource: EResource.PERMISSION,
  }),
);

export async function listAllRoles(context: TContext): Promise<RoleModel[]> {
  await verifyAuthorizedUser(context, canPerformUListAllRoles);
  const { rolesDao, rolePermissionsDao } = context;
  const roleModels: IRole[] = [];
  for await (const role of rolesDao.listAll()) {
    roleModels.push(role);
  }
  const roles = await Promise.all(roleModels);
  return roles.map((r) => new RoleModel(rolesDao, rolePermissionsDao, r.id, r));
}

const canPerformDeleteRoleAction = defaultAdminStrategyAll(
  EResource.ROLE,
  isActionOnResource({
    action: EActions.DELETE,
    resource: EResource.ROLE,
  }),
);

export async function deleteRole(
  context: TContext,
  info: GraphQLResolveInfo,
  roleId: string,
) {
  context.requireMutation(info);
  await verifyAuthorizedUser(context, canPerformDeleteRoleAction);
  const { rolesDao, userRolesDao, rolePermissionsDao } = context;
  await rolesDao.deleteRole(userRolesDao, rolePermissionsDao, roleId);
  return true;
}
