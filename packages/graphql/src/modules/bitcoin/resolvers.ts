import { estimateFeesWithMempool } from "./fees.js";
import { BitcoinModule } from "./generated-types/module-types.js";
import { MempoolModel } from "./models.js";
import { toBitcoinNetworkName } from "./transforms.js";

export const resolvers: BitcoinModule.Resolvers = {
  Query: {
    currentBitcoinFees: async (
      _,
      { network, speed, feePerByte },
      { createMempoolBitcoinClient },
    ) => {
      const client = createMempoolBitcoinClient({
        network: toBitcoinNetworkName(network),
      });
      return estimateFeesWithMempool({
        mempoolBitcoinClient: new MempoolModel(client),
        feeLevel: speed,
        feePerByte,
      });
    },
  },
};
