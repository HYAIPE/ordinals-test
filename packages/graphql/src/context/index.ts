import { createDbContext, DbContext } from "./db.js";
import { createConfigContext, IConfigContext } from "./config.js";
import { createAwsContext, IAwsContext } from "./aws.js";
import { createStorageContext, IStorageContext } from "./storage.js";

export type Context = DbContext &
  IConfigContext &
  IAwsContext &
  IStorageContext;

export function createContext(): Context {
  const config = createConfigContext();
  const aws = createAwsContext(config);
  return {
    ...config,
    ...aws,
    ...createDbContext(),
    ...createStorageContext(aws),
  };
}
