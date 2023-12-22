import { createConfig, http } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import { sepoliaRpcUrl } from "./config.js";

export type TWagmiContext = ReturnType<typeof createWagmiContext>;

// const chains = configureChains<Chain>(
//   [sepolia],
//   [
//     jsonRpcProvider({
//       rpc: (chain) => {
//         switch (chain.id) {
//           case sepolia.id:
//             return {
//               http: sepoliaRpcUrl.get(),
//             };
//           default:
//             return null;
//         }
//       },
//     }),
//   ],
// );

createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl.get()),
  },
});

export function createWagmiContext() {
  return {};
}
