import { Home } from "@/routes/Home";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";

export default function Page() {
  return (
    <Home
      initialBitcoinNetwork={BitcoinNetworkType.Testnet}
      initialBitcoinPurpose={AddressPurpose.Ordinals}
    />
  );
}
