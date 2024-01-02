import { ClaimRoute } from "@/routes/Claim";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  return (
    <ClaimRoute
      initialBitcoinNetwork={BitcoinNetworkType.Mainnet}
      initialBitcoinPurpose={AddressPurpose.Payment}
      collectionId={collectionId}
    />
  );
}
