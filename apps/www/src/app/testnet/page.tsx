import { Home } from "@/routes/Home";
import { AddressPurposes } from "sats-connect";

export default function Page() {
  return (
    <Home
      initialBitcoinNetwork="Testnet"
      initialBitcoinPurpose={AddressPurposes.ORDINALS}
    />
  );
}
