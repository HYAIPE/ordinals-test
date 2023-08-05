import { Chain, mainnet, goerli, sepolia } from "@wagmi/chains";
export const supportedAppChains = [mainnet, goerli, sepolia] as const;

export const infuraKey = {
  get() {
    if (!process.env.NEXT_PUBLIC_INFURA_KEY) {
      throw new Error("INFURA_KEY not set");
    }
    return process.env.NEXT_PUBLIC_INFURA_KEY;
  },
};

export const alchemyKey = {
  get() {
    if (!process.env.NEXT_PUBLIC_ALCHEMY_KEY) {
      throw new Error("ALCHEMY_KEY not set");
    }
    return process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  },
};

export const appName = {
  get() {
    if (!process.env.NEXT_PUBLIC_APP_NAME) {
      throw new Error("NEXT_PUBLIC_APP_NAME is not set");
    }
    return process.env.NEXT_PUBLIC_APP_NAME;
  },
};

export const sepoliaEnsRegistryAddress = {
  get() {
    if (!process.env.NEXT_PUBLIC_SEPOLIA_ENS_REGISTRY_ADDRESS) {
      throw new Error("NEXT_PUBLIC_SEPOLIA_ENS_REGISTRY_ADDRESS is not set");
    }
    return process.env
      .NEXT_PUBLIC_SEPOLIA_ENS_REGISTRY_ADDRESS as `0x${string}`;
  },
};

export const sepoliaEnsUniversalResolverAddress = {
  get() {
    if (!process.env.NEXT_PUBLIC_SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS) {
      throw new Error(
        "NEXT_PUBLIC_SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS is not set"
      );
    }
    return process.env
      .NEXT_PUBLIC_SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS as `0x${string}`;
  },
};

const networkOverrides: Record<
  string,
  | undefined
  | {
      ensRegistry: { get(): `0x${string}` };
      ensUniversalResolver: { get(): `0x${string}` };
    }
> = {
  "11155111": {
    ensRegistry: sepoliaEnsRegistryAddress,
    ensUniversalResolver: sepoliaEnsUniversalResolverAddress,
  },
};

export const supportedChains = {
  get() {
    if (!process.env.NEXT_PUBLIC_SUPPORTED_CHAINS) {
      throw new Error("SUPPORTED_CHAINS is not set");
    }
    const chains: Chain[] = [];
    for (const chainName of JSON.parse(
      process.env.NEXT_PUBLIC_SUPPORTED_CHAINS
    ) as string[]) {
      let wagmiChain: Chain | undefined = supportedAppChains.find(
        ({ network }) => network === chainName
      );

      if (wagmiChain) {
        const networkOverride = networkOverrides[wagmiChain.id.toString()];
        if (networkOverride) {
          wagmiChain = {
            ...wagmiChain,
            contracts: {
              ...wagmiChain.contracts,
              ensRegistry: {
                address: networkOverride.ensRegistry.get(),
                blockCreated: 1687562,
              },
              ensUniversalResolver: {
                address: networkOverride.ensUniversalResolver.get(),
                blockCreated: 1687562,
              },
            },
          };
        }
        chains.push(wagmiChain);
      }
    }
    return chains;
  },
};

export const defaultChain = {
  get() {
    if (!process.env.NEXT_PUBLIC_ETHEREUM_DEFAULT_CHAIN_ID) {
      throw new Error("NEXT_PUBLIC_ETHEREUM_DEFAULT_CHAIN_ID is not set");
    }
    const chainId = process.env.NEXT_PUBLIC_ETHEREUM_DEFAULT_CHAIN_ID;
    const wagmiChain = supportedAppChains.find(
      ({ id }) => id === Number(chainId)
    );
    return wagmiChain || mainnet;
  },
};
