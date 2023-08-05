import { FC, PropsWithChildren } from "react";
import { Provider as XverseProvider } from "../features/xverse/Context";
import { AddressPurposes, BitcoinNetwork } from "sats-connect";
import { Provider as Web3Provider } from "@/features/web3";
import { Provider as AuthProvider } from "@/features/auth";
import { WagmiConfig } from "wagmi";
import {
  wagmiConfig,
  wagmiConfigAutoConnectConfig,
} from "@/features/web3/wagmi";

export const MultiChainProvider: FC<
  PropsWithChildren<{
    autoLogin?: boolean;
    bitcoinNetwork?: BitcoinNetwork["type"];
    bitcoinPurpose?: AddressPurposes;

    ethereumAutoConnect?: boolean;
  }>
> = ({
  children,
  autoLogin,
  ethereumAutoConnect,
  bitcoinNetwork,
  bitcoinPurpose,
}) => {
  return (
    <WagmiConfig
      config={
        ethereumAutoConnect
          ? wagmiConfigAutoConnectConfig.get()
          : wagmiConfig.get()
      }
    >
      <XverseProvider network={bitcoinNetwork} purpose={bitcoinPurpose}>
        <Web3Provider>
          <AuthProvider autoLogin={autoLogin}>{children}</AuthProvider>
        </Web3Provider>
      </XverseProvider>
    </WagmiConfig>
  );
};
