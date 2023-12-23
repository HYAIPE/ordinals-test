"use client";
import { DefaultProvider } from "@/context/default";
import Grid2 from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import { Connect } from "@/features/xverse/Connect";
import { useXverse } from "@/features/xverse/Context";
import { AsyncStatus } from "@/features/xverse/ducks";
import { SwitchableNetwork } from "@/layouts/SwitchableNetwork";
import { AddressPurposes } from "sats-connect";
import { FC } from "react";

const TestConnectCard = () => {
  const {
    state: { ordinalsAddress, connectionStatus },
  } = useXverse();
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Connect
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Connect to Xverse
        </Typography>
        <Typography variant="body2" textOverflow="ellipsis" overflow="hidden">
          {connectionStatus === AsyncStatus.FULFILLED
            ? ordinalsAddress
            : "Connect to Xverse to get started"}
        </Typography>
      </CardContent>
      <CardActions>
        <Connect />
      </CardActions>
    </Card>
  );
};

export const Home: FC<{
  initialBitcoinNetwork: "Mainnet" | "Testnet";
  initialBitcoinPurpose: AddressPurposes;
}> = ({ initialBitcoinNetwork, initialBitcoinPurpose }) => {
  return (
    <DefaultProvider>
      <SwitchableNetwork
        title="home"
        initialBitcoinNetwork={initialBitcoinNetwork}
        initialBitcoinPurpose={initialBitcoinPurpose}
      >
        <Grid2 container spacing={2}>
          <Grid2 xs={12} sm={6} md={4}>
            <TestConnectCard />
          </Grid2>
        </Grid2>
      </SwitchableNetwork>
    </DefaultProvider>
  );
};
