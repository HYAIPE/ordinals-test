import { ClaimRoute } from "@/routes/Claim";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  return (
    <ClaimRoute
      initialBitcoinNetwork={BitcoinNetworkType.Testnet}
      initialBitcoinPurpose={AddressPurpose.Payment}
      collectionId={collectionId}
    />
  );
}
