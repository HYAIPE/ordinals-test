import { bitcoinToSats } from "@0xflick/inscriptions";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { InscriptionFundingModule } from "./generated-types/module-types.js";
import { getFundingModel } from "./controllers.js";

export const resolvers: InscriptionFundingModule.Resolvers = {
  Query: {
    inscriptionFunding: async (
      _,
      { id },
      { fundingDao, fundingDocDao, inscriptionBucket, s3Client },
    ) => {
      return getFundingModel({
        id,
        fundingDao,
        fundingDocDao,
        inscriptionBucket,
        s3Client,
      });
    },
  },
  InscriptionFunding: {
    async inscriptionTransaction(parent, _) {
      await parent.fetchInscription();
      return new InscriptionTransactionModel(parent);
    },
    fundingAmountSats: async (p) => {
      return Number(bitcoinToSats(await p.fundingAmountBtc));
    },
    network: async (p) => {
      switch (await p.network) {
        case "mainnet":
          return "MAINNET";
        case "testnet":
          return "TESTNET";
        case "regtest":
          return "REGTEST";
        default:
          throw new Error(`Unknown network: ${await p.network}`);
      }
    },
    qrSrc: async (p) => {
      return (await p.getQrSrc({})).src;
    },
  },
};
