import { join, dirname } from "path";
import { createModule, createApplication } from "@0xflick/graphql-modules";
import { loadFiles } from "@graphql-tools/load-files";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export * from "./context/index.js";
export async function createGraphqlApplication() {
  const [typeDefs, resolvers] = await Promise.all([
    loadFiles(join(__dirname, "./modules/**/typedefs/*.graphql")),
    loadFiles(join(__dirname, "./modules/**/resolvers.ts")),
  ]);

  console.log(`Found ${typeDefs.length} typeDefs files`);
  console.log(`Found ${resolvers.length} resolvers files`);
  const module = createModule({
    id: "ordinals",
    typeDefs,
    resolvers,
  });

  const application = createApplication({
    modules: [module],
  });

  return application;
}
