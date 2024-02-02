import { PayRoute } from "@/routes/Pay";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page({
  params: { fundingId },
}: {
  params: { fundingId: string };
}) {
  return (
    <PayRoute
      initialBitcoinNetwork={BitcoinNetworkType.Mainnet}
      initialBitcoinPurpose={AddressPurpose.Payment}
      fundingId={fundingId}
    />
  );
}
