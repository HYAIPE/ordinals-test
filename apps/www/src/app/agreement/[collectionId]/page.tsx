import { AgreementRoute } from "@/routes/Agreement";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  return (
    <AgreementRoute
      initialBitcoinNetwork={BitcoinNetworkType.Mainnet}
      initialBitcoinPurpose={AddressPurpose.Payment}
      collectionId={collectionId}
    />
  );
}
