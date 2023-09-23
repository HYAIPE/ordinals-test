import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { QueryModule } from "./generated-types/module-types.js";
import { getFundingModel } from "../inscriptionFunding/controllers.js";

export const resolvers: QueryModule.Resolvers = {
  Query: {
    inscriptionTransaction: async (
      _,
      { id },
      { fundingDao, fundingDocDao, inscriptionBucket, s3Client },
    ) => {
      return new InscriptionTransactionModel(
        await getFundingModel({
          id,
          fundingDao,
          fundingDocDao,
          inscriptionBucket,
          s3Client,
        }),
      );
    },
  },
};
