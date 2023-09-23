import { defineConfig } from "@wagmi/cli";
import { hardhat, actions } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/wagmi/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "../contracts",
    }),
    actions({
      readContract: true,
      writeContract: true,
      watchContractEvent: true,
      prepareWriteContract: true,
    }),
  ],
});
