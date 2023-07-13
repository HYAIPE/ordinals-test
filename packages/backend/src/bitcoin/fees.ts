import { MempoolClient } from "./mempool.js";

export type IFeesRecommended = Awaited<
  ReturnType<MempoolClient["bitcoin"]["fees"]["getFeesRecommended"]>
>;

export async function estimateFees(
  mempool: MempoolClient["bitcoin"]
): Promise<IFeesRecommended> {
  const fees = await mempool.fees.getFeesRecommended();
  return fees;
}
