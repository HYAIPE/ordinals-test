import {
  createInscriptionTransaction,
  createMempoolClient,
  estimateFees,
} from "@0xflick/ordinals-backend";
import { MutationModule } from "./generated-types/module-types.js";
import { toBitcoinNetworkName, toFeeLevel } from "../bitcoin/transforms.js";

export const resolvers: MutationModule.Resolvers = {
  Mutation: {
    requestFundingAddress: async (
      _,
      { request: { destinationAddress, files, feeLevel, feePerByte, network } },
      { fundingDao, fundingDocDao, inscriptionBucket }
    ) => {
      let finalFee;
      if (feePerByte) {
        finalFee = feePerByte;
      } else if (feeLevel) {
        const mempoolClient = createMempoolClient({
          network: toBitcoinNetworkName(network),
        });
        const feeEstimate = await estimateFees(mempoolClient);
        finalFee = toFeeLevel(feeLevel, feeEstimate);
      } else {
        const mempoolClient = createMempoolClient({
          network: toBitcoinNetworkName(network),
        });
        const feeEstimate = await estimateFees(mempoolClient);
        finalFee = toFeeLevel("MEDIUM", feeEstimate);
      }
      await createInscriptionTransaction({
        address: destinationAddress,
        feeRate: finalFee,
        network: toBitcoinNetworkName(network),
        tip: 0,
      });
      await inscriptionBucket.put({
        key: fundingAddressHash,
        data: request,
      });
      return { fundingAddress, fundingAddressHash };
    },
  },
};
