"use client";
import { FC } from "react";
import { DefaultProvider } from "@/context/default";
import Grid2 from "@mui/material/Unstable_Grid2";
import { SwitchableNetwork } from "@/layouts/SwitchableNetwork";
import { ActiveMint } from "@/features/inscription";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { AutoConnect } from "@/features/web3";

export const MintRoute: FC<{
  collectionId: string;
  destinationAddress: string;
  initialBitcoinNetwork: BitcoinNetworkType;
  initialBitcoinPurpose: AddressPurpose;
}> = ({
  collectionId,
  destinationAddress,
  initialBitcoinNetwork,
  initialBitcoinPurpose,
}) => {
  return (
    <DefaultProvider>
      <SwitchableNetwork
        title="mint"
        initialBitcoinNetwork={initialBitcoinNetwork}
        initialBitcoinPurpose={initialBitcoinPurpose}
        ethereumAutoConnect={false}
      >
        <AutoConnect>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} sm={12} md={12}>
              <ActiveMint
                collectionId={collectionId}
                destinationAddress={destinationAddress}
              />
            </Grid2>
          </Grid2>
        </AutoConnect>
      </SwitchableNetwork>
    </DefaultProvider>
  );
};
