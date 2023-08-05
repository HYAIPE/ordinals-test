import { bitcoinToSats } from "@0xflick/inscriptions";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import { InscriptionFundingModule } from "./generated-types/module-types.js";

export const resolvers: InscriptionFundingModule.Resolvers = {
  InscriptionFunding: {
    async inscriptionTransaction(parent, _, context) {
      await parent.fetchInscription(context.s3Client);
      return new InscriptionTransactionModel(parent);
    },
    fundingAmountSats: (p) => {
      return Number(bitcoinToSats(p.fundingAmountBtc));
    },
    network: (p) => {
      switch (p.network) {
        case "mainnet":
          return "MAINNET";
        case "testnet":
          return "TESTNET";
        case "regtest":
          return "REGTEST";
        default:
          throw new Error(`Unknown network: ${p.network}`);
      }
    },
    qrSrc: async (p) => {
      return p.getQrSrc({}).src;
    },
  },
};
