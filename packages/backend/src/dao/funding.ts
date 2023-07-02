import { IFundingModel } from "@0xflick/ordinals-models";

export interface IFundingDao {
  createFunding(item: IFundingModel): Promise<void>;
  getFunding(address: string): Promise<IFundingModel>;
  deleteFunding(address: string): Promise<void>;
}
