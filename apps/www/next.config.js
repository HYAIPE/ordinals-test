const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "www";
const graphqlEndpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:4000";
const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY ?? "INFURA_KEY";
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? "ALCHEMY_KEY";
const ethereumDefaultChainId =
  process.env.NEXT_PUBLIC_ETHEREUM_DEFAULT_CHAIN_ID ?? "11155111";
const supportedChains =
  process.env.NEXT_PUBLIC_SUPPORTED_CHAINS ?? '["sepolia"]';
const sepoliaEnsRegistryAddress =
  process.env.NEXT_PUBLIC_SEPOLIA_ENS_REGISTRY_ADDRESS ??
  "0xDd424d97499C609ca99a3Fd71C47c8016312f917";
const sepoliaEnsUniversalResolverAddress =
  process.env.NEXT_PUBLIC_SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS ??
  "0x156381BB699B8637000a919ac35B46E4C9DB7545";

const webConnectProjectId = process.env.NEXT_PUBLIC_WEB_CONNECT_PROJECT_ID ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@0xflick/ordinals-rbac-models"],
  env: {
    NEXT_PUBLIC_APP_NAME: appName,
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: graphqlEndpoint,
    NEXT_PUBLIC_ALCHEMY_KEY: alchemyKey,
    NEXT_PUBLIC_INFURA_KEY: infuraKey,
    NEXT_PUBLIC_ETHEREUM_DEFAULT_CHAIN_ID: ethereumDefaultChainId,
    NEXT_PUBLIC_SUPPORTED_CHAINS: supportedChains,
    NEXT_PUBLIC_SEPOLIA_ENS_REGISTRY_ADDRESS: sepoliaEnsRegistryAddress,
    NEXT_PUBLIC_SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS:
      sepoliaEnsUniversalResolverAddress,
    NEXT_PUBLIC_WEB_CONNECT_PROJECT_ID: webConnectProjectId,
  },
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        extensionAlias: {
          ".js": [".js", ".ts"],
          ".jsx": [".jsx", ".tsx"],
        },
      },
    };
  },
};

module.exports = nextConfig;
