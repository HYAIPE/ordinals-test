import { Home } from "@/routes/Home";
import { AddressPurpose } from "sats-connect";

export default function Page() {
  return (
    <Home
      initialBitcoinNetwork="Testnet"
      initialBitcoinPurpose={AddressPurpose.Ordinals}
    />
  );
}
