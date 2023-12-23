import { AdminRoute } from "@/routes/Admin";
import { AddressPurposes } from "sats-connect";

export default function Page() {
  return (
    <AdminRoute
      initialBitcoinNetwork="Testnet"
      initialBitcoinPurpose={AddressPurposes.ORDINALS}
    />
  );
}
