export interface IIncrementingRevealCollectionMeta {
  lastTokenId?: number;
  // in priority order: 1. nextBlockHeightReveal, 2. nextBlockHeightRevealDelta, 3. instant reveal (if previous two are undefined)
  nextBlockHeightReveal?: number;
  nextBlockHeightRevealDelta?: number;
}

export interface IIncrementingRevealItemMeta {
  tokenId: number;
}
