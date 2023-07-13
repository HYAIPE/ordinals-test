import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { InscriptionFundingModule } from "./generated-types/module-types.js";

export const resolvers: InscriptionFundingModule.Resolvers = {
  InscriptionFunding: {
    async inscriptionTransaction(parent, _, context) {
      await parent.fetchInscription(context.s3Client);
      return new InscriptionTransactionModel(parent);
    },
  },
};
