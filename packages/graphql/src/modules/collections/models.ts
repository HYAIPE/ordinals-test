import { ID_Collection, TCollectionModel } from "@0xflick/ordinals-models";

export class CollectionModel {
  public id: ID_Collection;
  public name: string;
  public totalCount: number;
  public maxSupply: number;
  public pendingCount: number;
  public meta: Record<string, any>;

  constructor(model: TCollectionModel) {
    this.id = model.id;
    this.name = model.name;
    this.totalCount = model.totalCount;
    this.maxSupply = model.maxSupply;
    this.pendingCount = model.pendingCount;
    this.meta = model.meta ?? {};
  }
}
