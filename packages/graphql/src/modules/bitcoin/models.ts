import { MempoolClient } from "@0xflick/ordinals-backend";

export class MempoolModel {
  public mempoolClient: MempoolClient["bitcoin"];

  constructor(mempoolClient: MempoolClient["bitcoin"]) {
    this.mempoolClient = mempoolClient;
  }

  public recommendedFees() {
    return this.mempoolClient.fees.getFeesRecommended();
  }

  public tipHeight() {
    return this.mempoolClient.blocks.getBlocksTipHeight();
  }
}
