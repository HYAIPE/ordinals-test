import { IFundingDao, IFundingDocDao } from "@0xflick/ordinals-backend";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { QueryModule } from "./generated-types/module-types.js";

async function getFundingModel({
  id,
  fundingDao,
  fundingDocDao,
  inscriptionBucket,
}: {
  id: string;
  fundingDao: IFundingDao;
  fundingDocDao: IFundingDocDao;
  inscriptionBucket: string;
}) {
  const funding = await fundingDao.getFunding(id);
  const document = await fundingDocDao.getInscriptionTransaction({
    id,
    fundingAddress: funding.address,
  });
  return new InscriptionFundingModel({
    id,
    document,
    bucket: inscriptionBucket,
  });
}

export const resolvers: QueryModule.Resolvers = {
  Query: {
    inscriptionFunding: async (
      _,
      { id },
      { fundingDao, fundingDocDao, inscriptionBucket }
    ) => {
      return getFundingModel({
        id,
        fundingDao,
        fundingDocDao,
        inscriptionBucket,
      });
    },
    inscriptionTransaction: async (
      _,
      { id },
      { fundingDao, fundingDocDao, inscriptionBucket }
    ) => {
      return new InscriptionTransactionModel(
        await getFundingModel({
          id,
          fundingDao,
          fundingDocDao,
          inscriptionBucket,
        })
      );
    },
  },
};
