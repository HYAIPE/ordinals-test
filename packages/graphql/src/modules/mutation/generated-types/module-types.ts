/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace MutationModule {
  interface DefinedFields {
    Mutation: 'requestFundingAddress' | 'axolotlFundingAddressRequest' | 'rbac' | 'nonceEthereum' | 'nonceBitcoin' | 'siwe';
  };
  
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type InscriptionFunding = Types.InscriptionFunding;
  export type InscriptionRequest = Types.InscriptionRequest;
  export type AxolotlFunding = Types.AxolotlFunding;
  export type AxolotlRequest = Types.AxolotlRequest;
  export type MutationRBAC = Types.MutationRbac;
  export type Nonce = Types.Nonce;
  export type Web3LoginUser = Types.Web3LoginUser;
  
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
      rbac?: gm.Middleware[];
      nonceEthereum?: gm.Middleware[];
      nonceBitcoin?: gm.Middleware[];
      siwe?: gm.Middleware[];
    };
  };
}