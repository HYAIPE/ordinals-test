import {
  createDynamoDbFundingDao,
  IFundingDao,
  getDb,
  createDynamoDbClaimsDao,
  ClaimsDao,
  OpenEditionClaimsDao,
  createDynamoDbOpenEditionClaimsDao,
  FundingDao,
} from "@0xflick/ordinals-backend";
import {
  RolePermissionsDAO,
  RolesDAO,
  UserDAO,
  UserRolesDAO,
  createDynamoDbRolePermissionsDao,
  createDynamoDbRolesDao,
  createDynamoDbUserDao,
  createDynamoDbUserRolesDao,
} from "@0xflick/ordinals-rbac";
import { IConfigContext } from "./config.js";

export interface DbContext {
  fundingDao: FundingDao;
  typedFundingDao<
    ItemMeta extends Record<string, any> = {},
    CollectionMeta extends Record<string, any> = {},
  >(): FundingDao<ItemMeta, CollectionMeta>;
  userRolesDao: UserRolesDAO;
  rolesDao: RolesDAO;
  rolePermissionsDao: RolePermissionsDAO;
  userDao: UserDAO;
  claimsDao: ClaimsDao;
  openEditionClaimsDao: OpenEditionClaimsDao;
}

export function createDbContext(config: IConfigContext) {
  const db = getDb();
  const context: DbContext = {
    fundingDao: createDynamoDbFundingDao<{}, {}>(),
    typedFundingDao<
      ItemMeta extends Record<string, any> = {},
      CollectionMeta extends Record<string, any> = {},
    >() {
      return createDynamoDbFundingDao<ItemMeta, CollectionMeta>();
    },
    userRolesDao: createDynamoDbUserRolesDao({
      rbacTableName: config.tableNames.rbac,
      db,
    }),
    rolesDao: createDynamoDbRolesDao({
      rbacTableName: config.tableNames.rbac,
      db,
    }),
    rolePermissionsDao: createDynamoDbRolePermissionsDao({
      rbacTableName: config.tableNames.rbac,
      db,
    }),
    userDao: createDynamoDbUserDao({
      userNonceTableName: config.tableNames.userNonce,
      db,
    }),
    claimsDao: createDynamoDbClaimsDao({
      claimsTableName: config.tableNames.claims,
      db,
    }),
    openEditionClaimsDao: createDynamoDbOpenEditionClaimsDao({
      db,
      openEditionClaimsTableName: config.tableNames.openEditionClaims,
    }),
  };
  return context;
}
