"use client";
import { FC } from "react";
import { DefaultProvider } from "@/context/default";
import Grid2 from "@mui/material/Unstable_Grid2";
import { SwitchableNetwork } from "@/layouts/SwitchableNetwork";
import { AdminPanel } from "@/features/admin";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { AutoConnect } from "@/features/web3";

export const AdminRoute: FC<{
  initialBitcoinNetwork: BitcoinNetworkType;
  initialBitcoinPurpose: AddressPurpose;
}> = ({ initialBitcoinNetwork, initialBitcoinPurpose }) => {
  return (
    <DefaultProvider>
      <SwitchableNetwork
        title="home"
        initialBitcoinNetwork={initialBitcoinNetwork}
        initialBitcoinPurpose={initialBitcoinPurpose}
        ethereumAutoConnect={false}
      >
        <AutoConnect>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} sm={6} md={4}>
              <AdminPanel />
            </Grid2>
          </Grid2>
        </AutoConnect>
      </SwitchableNetwork>
    </DefaultProvider>
  );
};
