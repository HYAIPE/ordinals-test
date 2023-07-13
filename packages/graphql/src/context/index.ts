import { createDbContext, DbContext } from "./db.js";
import { createConfigContext, IConfigContext } from "./config.js";
import { createAwsContext, IAwsContext } from "./aws.js";
import { createStorageContext, IStorageContext } from "./storage.js";
import { createBitcoinContext, IBitcoinContext } from "./bitcoin.js";

export type Context = DbContext &
  IConfigContext &
  IAwsContext &
  IStorageContext &
  IBitcoinContext;

export function createContext(): Context {
  const config = createConfigContext();
  const aws = createAwsContext(config);
  return {
    ...config,
    ...aws,
    ...createDbContext(),
    ...createStorageContext({
      ...config,
      ...aws,
    }),
    ...createBitcoinContext(config),
  };
}
