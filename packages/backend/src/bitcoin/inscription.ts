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
    secKey,
  } = await generateFundingAddress({
    address,
    inscriptions,
    network,
    privKey,
    feeRate,
    tip,
    padding: 546,
  });

  return {
    id: toAddressInscriptionId(
      hashInscriptions(
        fundingAddress,
        inscriptionsToWrite.map((i) => i.tapkey),
      ),
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
    secKey: Buffer.from(secKey.raw).toString("hex"),
    totalFee,
    writableInscriptions: inscriptionsToWrite,
    tip,
  };
}
