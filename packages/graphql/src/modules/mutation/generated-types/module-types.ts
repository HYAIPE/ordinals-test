/* eslint-disable */
import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace MutationModule {
  interface DefinedFields {
    Mutation: 'requestFundingAddress' | 'axolotlFundingAddressRequest';
  };
  
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type InscriptionFunding = Types.InscriptionFunding;
  export type InscriptionRequest = Types.InscriptionRequest;
  
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      requestFundingAddress?: gm.Middleware[];
      axolotlFundingAddressRequest?: gm.Middleware[];
    };
  };
}