import { FC } from "react";

import { Start } from "../Start";
import { AgreementModal } from "../AgreementModal";
import { ActiveClaim } from "../ActiveClaim";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { useRouter } from "next/navigation";

export const Content: FC<{
  collectionId: string;
  initialBitcoinNetwork: BitcoinNetworkType;
  initialBitcoinPurpose: AddressPurpose;
  step: "start" | "agreement" | "claim" | "pay" | "done";
}> = ({ collectionId, initialBitcoinNetwork, initialBitcoinPurpose, step }) => {
  const router = useRouter();

  if (step === "start") {
    return (
      <Start
        onInscribe={() => {
          router.push(`/testnet/agreement/${collectionId}`, {});
        }}
      />
    );
  }

  if (step === "agreement") {
    return (
      <AgreementModal
        onClose={() => {
          router.push(`/testnet/start/${collectionId}`);
        }}
        onAgree={() => {
          router.push(`/testnet/claim/${collectionId}`);
        }}
      />
    );
  }

  if (step === "claim") {
    return <ActiveClaim network={initialBitcoinNetwork} />;
  }

  if (step === "pay") {
    return <ActiveClaim network={initialBitcoinNetwork} />;
  }
  return null;
};
