import { IFundingDao } from "@0xflick/ordinals-backend";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { QueryModule } from "./generated-types/module-types.js";

async function getFundingModel({
  id,
  fundingDao,
  inscriptionBucket,
}: {
  id: string;
  fundingDao: IFundingDao;
  inscriptionBucket: string;
}) {
  const funding = await fundingDao.getFunding(id);
  return new InscriptionFundingModel({
    id,
    fundingAddressModel: {
      fundingAddress: funding.address,
      network: funding.network,
    },
    bucket: inscriptionBucket,
  });
}

export const resolvers: QueryModule.Resolvers = {
  Query: {
    inscriptionTransaction: async (
      _,
      { id },
      { fundingDao, inscriptionBucket }
    ) => {
      return new InscriptionTransactionModel(
        await getFundingModel({ id, fundingDao, inscriptionBucket })
      );
    },
    inscriptionFunding: async (
      _,
      { id },
      { fundingDao, inscriptionBucket }
    ) => {
      return getFundingModel({ id, fundingDao, inscriptionBucket });
    },
  },
};
