import { AdminRoute } from "@/routes/Admin";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page() {
  return (
    <AdminRoute
      initialBitcoinNetwork={BitcoinNetworkType.Mainnet}
      initialBitcoinPurpose={AddressPurpose.Ordinals}
    />
  );
}
