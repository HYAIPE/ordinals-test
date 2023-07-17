/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:4000",
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
  // experimental: {
  //   swcPlugins: [
  //     [
  //       'swc-plugin-transform-import',
  //       {
  //         ".": {
  //           transform: "./swc/import.js",
  //           preventFullImport: true,
  //         },
  //       }
  //     ],
  //   ],
  // },
}

module.exports = nextConfig
