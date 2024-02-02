import { StartRoute } from "@/routes/Start";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  return (
    <StartRoute
      initialBitcoinNetwork={BitcoinNetworkType.Mainnet}
      initialBitcoinPurpose={AddressPurpose.Payment}
      collectionId={collectionId}
    />
  );
}
