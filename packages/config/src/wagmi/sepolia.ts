import { Chain, sepolia as wagmiSepolia } from "@wagmi/core/chains";
import { lazySingleton } from "../lazy.js";
import { TAdminChain } from "../types.js";

export const sepoliaEnsRegistryAddress = lazySingleton(() => {
  return (
    process.env.SEPOLIA_ENS_REGISTRY_ADDRESS ??
    "0xDd424d97499C609ca99a3Fd71C47c8016312f917"
  );
});

export const sepoliaEnsUniversalResolverAddress = lazySingleton(() => {
  return (
    process.env.SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS ??
    "0x156381BB699B8637000a919ac35B46E4C9DB7545"
  );
});

export const sepoliaEnsAdmin = lazySingleton(() => {
  if (!process.env.SEPOLIA_ENS_ADMIN) {
    throw new Error("SEPOLIA_ENS_ADMIN not set");
  }
  return process.env.SEPOLIA_ENS_ADMIN;
});

export const sepoliaRpcUrl = lazySingleton(() => {
  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL not set");
  }
  return process.env.SEPOLIA_RPC_URL;
});

export const sepolia: TAdminChain<
  Omit<typeof wagmiSepolia, "contracts"> & { contracts: Chain["contracts"] }
> = {
  ...wagmiSepolia,
  ensAdmin: sepoliaEnsAdmin.get(),
  contracts: {
    ...wagmiSepolia.contracts,
    ensUniversalResolver: {
      address: "0x156381BB699B8637000a919ac35B46E4C9DB7545" as const,
    },
    ensRegistry: {
      address: "0xDd424d97499C609ca99a3Fd71C47c8016312f917" as const,
    },
  },
};
