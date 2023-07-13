import { MempoolClient, estimateFees } from "@0xflick/ordinals-backend";
import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { toFeeLevel } from "./transforms.js";

export async function estimateFeesWithMempool({
  mempoolBitcoinClient,
  feePerByte,
  feeLevel,
}: {
  mempoolBitcoinClient: MempoolClient["bitcoin"];
  feePerByte?: InputMaybe<number>;
  feeLevel?: InputMaybe<FeeLevel>;
}): Promise<number> {
  let finalFee: number;
  if (feePerByte) {
    finalFee = feePerByte;
  } else if (feeLevel) {
    const feeEstimate = await estimateFees(mempoolBitcoinClient);
    finalFee = toFeeLevel(feeLevel, feeEstimate);
  } else {
    const feeEstimate = await estimateFees(mempoolBitcoinClient);
    finalFee = toFeeLevel("MEDIUM", feeEstimate);
  }
  return finalFee;
}
