import { BitcoinNetworkType } from "sats-connect";
import { BitcoinNetwork } from "./types";

export const toGraphqlBitcoinNetwork = (
  network: BitcoinNetworkType
): BitcoinNetwork => {
  switch (network) {
    case BitcoinNetworkType.Mainnet:
      return BitcoinNetwork.Mainnet;
    case BitcoinNetworkType.Testnet:
      return BitcoinNetwork.Testnet;
  }
};
