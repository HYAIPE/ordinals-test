import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/modules/**/typedefs/*.graphql",
  emitLegacyCommonJSImports: false,
  generates: {
    "./src/modules/": {
      preset: "@0xflick/graphql-modules-preset" as "graphql-modules",
      config: {
        useTypeImports: true,
        useEsmImports: true,
        graphqlModulesImportPath: "@0xflick/graphql-modules",
        contextType: "../context/index.js#Context",
        mappers: {
          InscriptionTransaction:
            "../modules/inscriptionTransaction/models.js#InscriptionTransactionModel",
          InscriptionFunding:
            "../modules/inscriptionFunding/models.js#InscriptionFundingModel",
          InscriptionTransactionContent:
            "../modules/inscriptionRequest/models.js#InscriptionTransactionContentModel",
        },
      },
      presetConfig: {
        baseTypesPath: "../generated-types/graphql.ts",
        filename: "generated-types/module-types.ts",
      },
      plugins: [
        {
          add: {
            content: "/* eslint-disable */",
          },
        },
        "typescript",
        "typescript-resolvers",
      ],
    },
  },
};
export default config;
