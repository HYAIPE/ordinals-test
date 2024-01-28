"use client";
import { FC } from "react";
import { DefaultProvider } from "@/context/default";
import Grid2 from "@mui/material/Unstable_Grid2";
import { SwitchableNetwork } from "@/layouts/SwitchableNetwork";
import { Pay } from "@/features/inscription";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { AutoConnect } from "@/features/web3";
import { Status } from "../features/inscription";

export const StatusRoute: FC<{
  fundingId: string;
  initialBitcoinNetwork: BitcoinNetworkType;
  initialBitcoinPurpose: AddressPurpose;
}> = ({ fundingId, initialBitcoinNetwork, initialBitcoinPurpose }) => {
  return (
    <DefaultProvider>
      <SwitchableNetwork
        title="bitflick"
        initialBitcoinNetwork={initialBitcoinNetwork}
        initialBitcoinPurpose={initialBitcoinPurpose}
        ethereumAutoConnect={false}
      >
        <AutoConnect>
          <Grid2 container spacing={2} sx={{ mt: 10 }}>
            <Grid2 xs={12} sm={12} md={12}>
              <Status fundingId={fundingId} />
            </Grid2>
          </Grid2>
        </AutoConnect>
      </SwitchableNetwork>
    </DefaultProvider>
  );
};
