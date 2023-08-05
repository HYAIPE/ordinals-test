import type { ITokenContext } from "./token.js";
import { createDbContext, DbContext } from "./db.js";
import { createConfigContext, IConfigContext } from "./config.js";
import { createAwsContext, IAwsContext } from "./aws.js";
import { createStorageContext, IStorageContext } from "./storage.js";
import { createBitcoinContext, IBitcoinContext } from "./bitcoin.js";
import { createGraphqlContext, IGraphqlContext } from "./graphql.js";
import { createEthereumContext, IEthereumContext } from "./ethereum.js";
import { createWagmiContext, TWagmiContext } from "./wagmi.js";

export type RawContext = DbContext &
  IConfigContext &
  IAwsContext &
  IStorageContext &
  IBitcoinContext &
  IGraphqlContext &
  IEthereumContext &
  TWagmiContext;
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
    ...createEthereumContext(config),
    ...createGraphqlContext(),
    ...createWagmiContext(),
  };
}
