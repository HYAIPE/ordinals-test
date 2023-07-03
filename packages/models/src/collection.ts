export type ID_Collection = string & { __id_collection: never };

export function toCollectionId(id: string): ID_Collection {
  return id as ID_Collection;
}

export interface ICollectionModel {
  id: ID_Collection;
  name: string;
  maxSupply: number;
  totalCount: number;
}
