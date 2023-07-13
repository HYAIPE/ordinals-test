import { IOrdinalIncrementingRevealModel } from "@0xflick/ordinals-models";

export interface IIncrementingRevealMeta
  extends IOrdinalIncrementingRevealModel {}
interface IIncrementingRevealReturn {
  tokenId: number;
}

export interface IIncrementingRevealDao {
  nextTokenId(): Promise<IIncrementingRevealReturn>;
}
