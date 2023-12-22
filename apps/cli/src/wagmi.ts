import { iAllowanceAbi } from "@0xflick/ordinals-backend";
import { mainnet, sepolia, base } from "@wagmi/core/chains";
import { createConfig, watchContractEvent } from "@wagmi/core";
import { frameTransport } from "@0xflick/frame";

import ethProvider from "eth-provider";

export const config = createConfig({
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: frameTransport(),
    [sepolia.id]: frameTransport(),
    [base.id]: frameTransport(),
  },
});

export async function promiseClaimEvent({
  chainId,
  contractAddress,
}: {
  chainId: 1 | 11155111 | 8453;
  contractAddress: `0x${string}`;
}) {
  return new Promise((resolve) => {
    const cancel = watchContractEvent(config, {
      address: contractAddress,
      eventName: "Claimed",
      abi: iAllowanceAbi,
      chainId,
      onLogs(events) {
        cancel();
        resolve(events);
      },
    });
  });
}
