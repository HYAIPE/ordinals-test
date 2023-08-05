// import { TAllowedAction, UserWithRolesModel } from "@0xflick/models";
import { Context } from "../../context/index.js";
import { AuthError } from "./errors.js";
import {
  TAllowedAction,
  UserWithRolesModel,
  namespacedClaim,
  verifyJwtToken,
} from "@0xflick/ordinals-rbac-models";

export async function verifyAuthorizedUser(
  context: Context,
  authorizer?: (item: TAllowedAction[], user: UserWithRolesModel) => boolean,
) {
  const user = await authorizedUser(context);

  return authorizer ? defaultAuthorizer(context, user, authorizer) : user;
}

export async function defaultAuthorizer(
  context: Context,
  user: UserWithRolesModel,
  authorizer: (item: TAllowedAction[], user: UserWithRolesModel) => boolean,
) {
  const {
    rolePermissionsDao,
    providerForChain,
    ensAdminForChain,
    authMessageJwtClaimIssuer,
  } = context;
  const permissionsFromDb = await rolePermissionsDao.allowedActionsForRoleIds(
    user.roleIds,
  );

  let isAuthorized = authorizer(permissionsFromDb, user);
  if (isAuthorized) {
    return user;
  }
  // FIXME: auth: ens
  const chainIdFromToken = user.decodedToken?.[
    namespacedClaim("chainId", authMessageJwtClaimIssuer)
  ] as string | undefined;
  if (chainIdFromToken) {
    const provider = providerForChain(Number(chainIdFromToken));
    const adminEns = ensAdminForChain(Number(chainIdFromToken));
    const adminAddress = await provider.resolveName(adminEns);
    if (adminAddress === user.address) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new AuthError("Forbidden", "NOT_AUTHORIZED");
  }
  return user;
}

export async function authorizedUser({
  getToken,
  userRolesDao,
  authMessageJwtClaimIssuer,
}: Context) {
  const token = getToken();
  if (!token) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const user = await verifyJwtToken({
    token,
    issuer: authMessageJwtClaimIssuer,
  });
  if (!user) {
    throw new AuthError("Invalid token", "NOT_AUTHENTICATED");
  }

  // Now that we have the user, and know their address, we can check the roles
  const roleIds: string[] = [];
  for await (const roleId of userRolesDao.getRoleIds(user.address)) {
    roleIds.push(roleId);
  }

  // Now verify with roleIds
  await verifyJwtToken({
    token,
    roleIds,
    issuer: authMessageJwtClaimIssuer,
  });

  return user;
}
