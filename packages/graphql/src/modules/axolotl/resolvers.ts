import {AxolotlModule} from "./generated-types/module-types.js";
import { MutationModule } from "../mutation/generated-types/module-types.js";


export const resolvers: AxolotlModule.Resolvers & MutationModule.Resolvers = {
  Mutation: {
    axolotlFundingAddressRequest: async (
      _,
      { 
        request: { address: destinationAddress },
      },
      { fundingDao, fundingDocDao, inscriptionBucket }
    ) => {

    }
}
