import { defineConfig } from "@wagmi/cli";
import { hardhat, actions } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/wagmi/generated.ts",
  plugins: [
    hardhat({
      project: "../contracts",
    }),
    actions({
      readContract: false,
      writeContract: false,
      watchContractEvent: false,
      prepareWriteContract: false,
    }),
  ],
});
