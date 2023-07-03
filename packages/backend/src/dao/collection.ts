export interface ICollectionDao {
  inc(name: string): Promise<number>;
}
