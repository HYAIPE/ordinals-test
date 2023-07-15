import { TPermission, EActions, EResource } from "@0xflick/ordinals-rbac";
import {
  Permission,
  PermissionAction,
  PermissionResource,
} from "../../generated-types/graphql.js";

export function graphqlPermissionActionToModel(
  action: PermissionAction,
): EActions {
  switch (action) {
    case "CREATE":
      return EActions.CREATE;
    case "UPDATE":
      return EActions.UPDATE;
    case "DELETE":
      return EActions.DELETE;
    case "LIST":
      return EActions.LIST;
    case "GET":
      return EActions.GET;
    case "USE":
      return EActions.USE;
    case "ADMIN":
      return EActions.ADMIN;
    default:
      throw new Error(`Unknown permission action: ${action}`);
  }
}

export function modelPermissionActionToGraphql(
  action: EActions,
): PermissionAction {
  switch (action) {
    case EActions.CREATE:
      return "CREATE";
    case EActions.UPDATE:
      return "UPDATE";
    case EActions.DELETE:
      return "DELETE";
    case EActions.LIST:
      return "LIST";
    case EActions.GET:
      return "GET";
    case EActions.USE:
      return "USE";
    case EActions.ADMIN:
      return "ADMIN";
    default:
      throw new Error(`Unknown permission action: ${action}`);
  }
}

export function graphqlPermissionResourceToModel(
  resource: PermissionResource,
): EResource {
  switch (resource) {
    case "ALL":
      return EResource.ALL;
    case "USER":
      return EResource.USER;
    case "ADMIN":
      return EResource.ADMIN;
    case "PRESALE":
      return EResource.PRESALE;
    case "AFFILIATE":
      return EResource.AFFILIATE;
    default:
      throw new Error(`Unknown permission resource: ${resource}`);
  }
}

export function modelPermissionResourceToGraphql(
  resource: EResource,
): PermissionResource {
  switch (resource) {
    case EResource.ALL:
      return "ALL";
    case EResource.USER:
      return "USER"
    case EResource.ADMIN:
      return "ADMIN";
    case EResource.PRESALE:
      return "PRESALE";
    case EResource.AFFILIATE:
      return "AFFILIATE";
    default:
      throw new Error(`Unknown permission resource: ${resource}`);
  }
}

export function modelPermissionToGraphql(permission: TPermission): Permission {
  return {
    action: modelPermissionActionToGraphql(permission.action),
    resource: modelPermissionResourceToGraphql(permission.resource),
    identifier: permission.identifier,
  };
}

export function graphqlPermissionToModel(permission: Permission): TPermission {
  return {
    action: graphqlPermissionActionToModel(permission.action),
    resource: graphqlPermissionResourceToModel(permission.resource),
    ...permission.identifier ? { identifier: permission.identifier } : {},
  };
}
