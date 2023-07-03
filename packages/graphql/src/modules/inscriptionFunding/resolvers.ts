import { InscriptionTransactionContentModel } from "../inscriptionRequest/models.js";
import { InscriptionFundingModule } from "./generated-types/module-types.js";

export const resolvers: InscriptionFundingModule.Resolvers = {
  InscriptionFunding: {
    async inscriptionTransaction(parent, _, context) {
      await parent.fetchInscriptions(context.s3Client);

      return parent.inscriptionTransaction.map(inscription => new InscriptionTransactionContentModel(inscription));
    },

};
