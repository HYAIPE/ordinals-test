import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  generates: {
    "src/graphql/types.ts": {
      documents: "src/**/*.graphql",
      plugins: ["typescript"],
    },
    "src/apiGraphql/": {
      preset: "near-operation-file",
      documents: "src/apiGraphql/**/*.graphql",
      presetConfig: {
        baseTypesPath: "../graphql/types.ts",
      },
      config: {
        useTypeImports: true,
        emitLegacyCommonJSImports: false,
      },
      plugins: ["typescript-operations", "typescript-graphql-request"],
    },
    "src/features/": {
      preset: "near-operation-file",
      documents: "src/features/**/*.graphql",
      presetConfig: {
        extension: ".generated.tsx",
        baseTypesPath: "../graphql/types.ts",
      },
      config: {
        useTypeImports: true,
        emitLegacyCommonJSImports: false,
      },
      plugins: ["typescript-operations", "typescript-react-apollo"],
    },
    "./src/graphql/graphql.schema.json": {
      documents: "src/**/*.graphql",
      plugins: ["introspection"],
    },
  },
};

export default config;
