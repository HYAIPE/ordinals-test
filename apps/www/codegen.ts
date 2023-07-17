import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  documents: "src/**/*.graphql",
  generates: {
    "src/graphql/types.ts": {
      plugins: ["typescript"],
    },
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".generated.tsx",
        baseTypesPath: "graphql/types.ts",
      },
      config: {
        useTypeImports: true,
        emitLegacyCommonJSImports: false,
      },
      plugins: ["typescript-operations", "typescript-react-apollo"],
    },
    "./src/graphql/graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
