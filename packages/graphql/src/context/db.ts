import {
  createDynamoDbFundingDao,
  IFundingDao,
} from "@0xflick/ordinals-backend";

export interface DbContext {
  fundingDao: IFundingDao;
}

export function createDbContext() {
  const context: DbContext = {
    fundingDao: createDynamoDbFundingDao(),
  };
  return context;
}
