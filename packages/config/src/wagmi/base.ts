import { base as wagmiBase } from "@wagmi/core/chains";
import { lazySingleton } from "../lazy.js";
import { TAdminChain } from "../types.js";

export const baseEnsAdmin = lazySingleton(() => {
  if (!process.env.BASE_ENS_ADMIN) {
    throw new Error("BASE_ENS_ADMIN not set");
  }
  return process.env.BASE_ENS_ADMIN;
});

export const baseRpcUrl = lazySingleton(() => {
  if (!process.env.BASE_RPC_URL) {
    throw new Error("BASE_RPC_URL not set");
  }
  return process.env.BASE_RPC_URL;
});

export const baseWsRpcUrl = lazySingleton(() => {
  if (!process.env.BASE_WS_RPC_URL) {
    throw new Error("BASE_WS_RPC_URL not set");
  }
  return process.env.BASE_WS_RPC_URL;
});

export const base: TAdminChain<typeof wagmiBase> = {
  ...wagmiBase,
  ensAdmin: baseEnsAdmin.get(),
};
