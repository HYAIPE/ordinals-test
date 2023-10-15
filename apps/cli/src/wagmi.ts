import { watchIAllowanceEvent } from "@0xflick/ordinals-backend";
import { mainnet, sepolia, goerli } from "@wagmi/chains";
import { InjectedConnector, configureChains } from "@wagmi/core";

import ethProvider from "eth-provider";

export const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, goerli],
  [
    function (chain) {
      if (chain.id === 11155111) {
        return {
          chain,
          rpcUrls: { http: [process.env.SEPOLIA_RPC_URL!] },
        };
      }
      if (!chain.rpcUrls.public.http[0]) return null;
      return {
        chain,
        rpcUrls: chain.rpcUrls.public,
      };
    },
  ]
);

const frame = ethProvider("frame");
export const frameConnector = new InjectedConnector({
  options: {
    name: "Frame",
    getProvider: () => frame as any,
  },
});

export async function promiseClaimEvent({
  contractAddress,
  chainId,
}: {
  contractAddress: `0x${string}`;
  chainId: number;
}) {
  return new Promise((resolve) => {
    const cancel = watchIAllowanceEvent(
      {
        address: contractAddress,
        chainId,
        eventName: "Claimed",
      },
      (event) => {
        cancel();
        resolve(event);
      }
    );
  });
}
