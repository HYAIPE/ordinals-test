import {
  createDynamoDbFundingDao,
  createDynamoDbRolePermissionsDao,
  createDynamoDbRolesDao,
  createDynamoDbUserDao,
  createDynamoDbUserRolesDao,
  IFundingDao,
} from "@0xflick/ordinals-backend";
import {
  RolePermissionsDAO,
  RolesDAO,
  UserDAO,
  UserRolesDAO,
} from "@0xflick/ordinals-rbac";

export interface DbContext {
  fundingDao: IFundingDao;
  typedFundingDao<
    ItemMeta extends Record<string, any> = {},
    CollectionMeta extends Record<string, any> = {}
  >(): IFundingDao<ItemMeta, CollectionMeta>;
  userRolesDao: UserRolesDAO;
  rolesDao: RolesDAO;
  rolePermissionsDao: RolePermissionsDAO;
  userDao: UserDAO;
}

export function createDbContext() {
  const context: DbContext = {
    fundingDao: createDynamoDbFundingDao<{}, {}>(),
    typedFundingDao<
      ItemMeta extends Record<string, any> = {},
      CollectionMeta extends Record<string, any> = {}
    >() {
      return createDynamoDbFundingDao<ItemMeta, CollectionMeta>();
    },
    userRolesDao: createDynamoDbUserRolesDao(),
    rolesDao: createDynamoDbRolesDao(),
    rolePermissionsDao: createDynamoDbRolePermissionsDao(),
    userDao: createDynamoDbUserDao(),
  };
  return context;
}
