import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { toFeeLevel } from "./transforms.js";
import { MempoolModel } from "./models.js";

export async function estimateFeesWithMempool({
  mempoolBitcoinClient,
  feePerByte,
  feeLevel,
}: {
  mempoolBitcoinClient: MempoolModel;
  feePerByte?: InputMaybe<number>;
  feeLevel?: InputMaybe<FeeLevel>;
}): Promise<number> {
  let finalFee: number;
  if (feePerByte) {
    finalFee = feePerByte;
  } else if (feeLevel) {
    const feeEstimate = await mempoolBitcoinClient.recommendedFees();
    finalFee = toFeeLevel(feeLevel, feeEstimate);
  } else {
    const feeEstimate = await mempoolBitcoinClient.recommendedFees();
    finalFee = toFeeLevel("MEDIUM", feeEstimate);
  }
  return finalFee;
}
