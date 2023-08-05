export enum EActions {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LIST = "LIST",
  GET = "GET",
  USE = "USE",
  ADMIN = "ADMIN",
}
export type TActions = keyof typeof EActions;

export enum EResource {
  ALL = "ALL",
  USER = "USER",
  ADMIN = "ADMIN",
  PRESALE = "PRESALE",
  AFFILIATE = "AFFILIATE",
  ROLE = "ROLE",
  COLLECTION = "COLLECTION",
}

export type TResource = keyof typeof EResource;

export function isAction(possibleAction: string): possibleAction is EActions {
  return Object.values(EActions).includes(possibleAction as EActions);
}

export function isResource(
  possibleResource: string,
): possibleResource is EResource {
  return Object.values(EResource).includes(possibleResource as EResource);
}
