import { FC, useCallback } from "react";
import { Content } from "./Content";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { FeeLevel } from "@/graphql/types";
import Snackbar from "@mui/material/Snackbar";
import { useOpenEditionClaim } from "./hooks/useOpenEditionClaim";
import { useXverse } from "@/features/xverse";
import { toGraphqlBitcoinNetwork } from "@/graphql/transforms";
import { useRouter } from "next/navigation";
import { ClaimingModal } from "./ClaimingModal";

export const Container: FC<{
  network: BitcoinNetworkType;
  collectionId: string;
}> = ({ collectionId, network }) => {
  const router = useRouter();
  const [fetch, { error: openEditionClaimError, loading: openEditionLoading }] =
    useOpenEditionClaim();
  const { networkSelect, connect } = useXverse();
  const doClaim = useCallback(
    ({
      claimCount,
      destinationAddress,
      feeLevel,
      feePerByte,
    }: {
      claimCount: number;
      destinationAddress?: string;
      feeLevel?: FeeLevel;
      feePerByte?: number;
    }) => {
      if (!destinationAddress) {
        networkSelect({
          network,
          purpose: AddressPurpose.Ordinals,
        });
        connect({
          message: "Please connect your wallet to continue",
        }).then(({ ordinalsAddress }) => {
          if (ordinalsAddress) {
            fetch({
              variables: {
                request: {
                  collectionId,
                  destinationAddress: ordinalsAddress,
                  network: toGraphqlBitcoinNetwork(network),
                  claimCount,
                  feeLevel,
                  feePerByte,
                },
              },
            }).then(({ data }) => {
              if (data?.axolotlFundingOpenEditionRequest.data?.id) {
                router.push(
                  `${
                    network === BitcoinNetworkType.Testnet ? "/testnet" : ""
                  }/pay/${data.axolotlFundingOpenEditionRequest.data.id}`
                );
              }
            });
          }
        });
      } else {
        fetch({
          variables: {
            request: {
              collectionId,
              destinationAddress,
              network: toGraphqlBitcoinNetwork(network),
              claimCount,
              feeLevel,
              feePerByte,
            },
          },
        }).then(({ data }) => {
          if (data?.axolotlFundingOpenEditionRequest.data?.id) {
            router.push(
              `${
                network === BitcoinNetworkType.Testnet ? "/testnet" : ""
              }/pay/${data.axolotlFundingOpenEditionRequest.data.id}`
            );
          }
        });
      }
    },
    [collectionId, connect, fetch, network, networkSelect, router]
  );

  return (
    <>
      <Content network={network} onClaim={doClaim} />
      <ClaimingModal open={openEditionLoading} />
      <Snackbar
        open={!!openEditionClaimError}
        message={openEditionClaimError?.message}
        autoHideDuration={6000}
        onClose={() => {
          setTimeout(() => router.refresh(), 1000);
        }}
      />
    </>
  );
};
