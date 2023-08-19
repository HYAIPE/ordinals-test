import {
  BitcoinNetworkNames,
  InscriptionContent,
  InscriptionFile,
  generateFundingAddress,
  generatePrivKey,
} from "@0xflick/inscriptions";
import {
  hashInscriptions,
  toAddressInscriptionId,
  TInscriptionDoc,
} from "@0xflick/ordinals-models";

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
}): Promise<TInscriptionDoc & { files: InscriptionFile[] }> {
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
    files,
  } = await generateFundingAddress({
    address,
    inscriptions,
    network,
    privKey,
    feeRate,
    tip,
  });

  return {
    id: toAddressInscriptionId(
      hashInscriptions(
        fundingAddress,
        inscriptionsToWrite.map((i) => i.tapkey)
      )
    ),
    files,
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
    writableInscriptions: inscriptionsToWrite,
    tip,
  };
}
