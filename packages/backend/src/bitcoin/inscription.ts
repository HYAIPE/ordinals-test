import {
  BitcoinNetworkNames,
  InscriptionContent,
  generateFundingAddress,
  generatePrivKey,
} from "@0xflick/inscriptions";
import { IInscriptionDocFundingWait } from "../../../models/src/doc";

export async function createInscriptionTransaction({
  address,
  network,
  feeRate,
  tip,
  inscriptions,
}: {
  address: string;
  network: BitcoinNetworkNames;
  feeRate: number;
  tip: number;
  inscriptions: InscriptionContent[];
}): Promise<IInscriptionDocFundingWait> {
  const privKey = generatePrivKey();
  const {
    amount,
    fundingAddress,
    initCBlock,
    initLeaf,
    initScript,
    initTapKey,
    inscriptionsToWrite,
    overhead,
    padding,
    totalFee,
  } = await generateFundingAddress({
    address,
    inscriptions,
    network,
    privKey,
    feeRate,
    tip,
  });

  return {
    fundingAddress,
    fundingAmountBtc: amount,
    initCBlock,
    initLeaf,
    initScript,
    initTapKey,
    network,
    overhead,
    padding,
    secKey: privKey,
    totalFee,
    status: "funding-wait",
    writableInscriptions: inscriptionsToWrite,
  };
}
