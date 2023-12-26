import { MintRoute } from "@/routes/Mint";
import { AddressPurpose } from "sats-connect";

export default function Page({
  params: { collectionId, destinationAddress },
}: {
  params: { collectionId: string; destinationAddress: string };
}) {
  return (
    <MintRoute
      initialBitcoinNetwork="Testnet"
      initialBitcoinPurpose={AddressPurpose.Payment}
      collectionId={collectionId}
      destinationAddress={destinationAddress}
    />
  );
}
