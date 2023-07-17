export enum EActions {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LIST = "LIST",
  GET = "GET",
  USE = "USE",
  ADMIN = "ADMIN",
}
export type TActions =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LIST"
  | "GET"
  | "USE"
  | "ADMIN";

export enum EResource {
  ALL = "ALL",
  USER = "USER",
  USER_ROLE = "USER_ROLE",
  ADMIN = "ADMIN",
  PRESALE = "PRESALE",
  PERMISSION = "PERMISSION",
  AFFILIATE = "AFFILIATE",
}

export type TResource =
  | "ALL"
  | "USER"
  | "USER_ROLE"
  | "ADMIN"
  | "PRESALE"
  | "PERMISSION"
  | "ROLE"
  | "AFFILIATE";

export function isAction(possibleAction: string): possibleAction is EActions {
  return Object.values(EActions).includes(possibleAction as EActions);
}

export function isResource(
  possibleResource: string
): possibleResource is EResource {
  return Object.values(EResource).includes(possibleResource as EResource);
}
