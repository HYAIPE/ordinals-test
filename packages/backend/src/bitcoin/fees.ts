import { MempoolClient } from "./mempool.js";

export type IFeesRecommended = Awaited<
  ReturnType<MempoolClient["bitcoin"]["fees"]["getFeesRecommended"]>
>;

export async function estimateFees(
  mempool: MempoolClient
): Promise<IFeesRecommended> {
  const fees = await mempool.bitcoin.fees.getFeesRecommended();
  return fees;
}
