import { Chain, mainnet as wagmiMainnet } from "@wagmi/core/chains";
import { lazySingleton } from "../lazy.js";
import { TAdminChain } from "../types.js";

export const mainnetEnsAdmin = lazySingleton(() => {
  if (!process.env.MAINNET_ENS_ADMIN) {
    throw new Error("MAINNET_ENS_ADMIN not set");
  }
  return process.env.MAINNET_ENS_ADMIN;
});

export const mainnetRpcUrl = lazySingleton(() => {
  if (!process.env.MAINNET_RPC_URL) {
    throw new Error("MAINNET_RPC_URL not set");
  }
  return process.env.MAINNET_RPC_URL;
});

export const mainnet: TAdminChain<typeof wagmiMainnet> = {
  ...wagmiMainnet,
  ensAdmin: mainnetEnsAdmin.get(),
};
