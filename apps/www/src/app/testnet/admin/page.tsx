import { AdminRoute } from "@/routes/Admin";
import { AddressPurpose } from "sats-connect";

export default function Page() {
  return (
    <AdminRoute
      initialBitcoinNetwork="Testnet"
      initialBitcoinPurpose={AddressPurpose.Ordinals}
    />
  );
}
