import { IncrementingRevealDao } from "@0xflick/ordinals-backend";
import {
  IAxolotlCollectionIncrementalRevealMeta,
  IAxolotlItemMeta,
} from "../../modules/axolotl/models.js";

export interface IAxolotlContext {
  axolotlDao: IncrementingRevealDao<
    IAxolotlItemMeta,
    IAxolotlCollectionIncrementalRevealMeta
  >;
}

export function createAxolotlContext(): IAxolotlContext {
  const context: IAxolotlContext = {
    axolotlDao: new IncrementingRevealDao<
      IAxolotlItemMeta,
      IAxolotlCollectionIncrementalRevealMeta
    >(),
  };
  return context;
}
