import { createDbContext, DbContext } from "./db.js";
import { createConfigContext, IConfigContext } from "./config.js";
import { createAwsContext, IAwsContext } from "./aws.js";
import { createStorageContext, IStorageContext } from "./storage.js";
import { createBitcoinContext, IBitcoinContext } from "./bitcoin.js";
import { ITokenContext, TokenType } from "./token.js";

export type RawContext = DbContext &
  IConfigContext &
  IAwsContext &
  IStorageContext &
  IBitcoinContext;
export type Context = RawContext & ITokenContext;

export function createContext(): RawContext {
  const config = createConfigContext();
  const aws = createAwsContext(config);
  return {
    ...config,
    ...aws,
    ...createDbContext(config),
    ...createStorageContext({
      ...config,
      ...aws,
    }),
    ...createBitcoinContext(config),
  };
}
