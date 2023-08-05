/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace AxolotlModule {
  interface DefinedFields {
    AxolotlFunding: 'id' | 'inscriptionFunding' | 'tokenId' | 'createdAt' | 'originAddress' | 'chameleon';
    AxolotlFundingPage: 'items' | 'totalCount' | 'page' | 'cursor';
    Mutation: 'requestFundingAddress' | 'axolotlFundingAddressRequest';
  };
  
  interface DefinedInputFields {
    AxolotlRequest: 'claimingAddress' | 'network' | 'feeLevel' | 'feePerByte' | 'collectionId';
  };
  
  export type AxolotlRequest = Pick<Types.AxolotlRequest, DefinedInputFields['AxolotlRequest']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type FeeLevel = Types.FeeLevel;
  export type AxolotlFunding = Pick<Types.AxolotlFunding, DefinedFields['AxolotlFunding']>;
  export type InscriptionFunding = Types.InscriptionFunding;
  export type AxolotlFundingPage = Pick<Types.AxolotlFundingPage, DefinedFields['AxolotlFundingPage']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type InscriptionRequest = Types.InscriptionRequest;
  
  export type AxolotlFundingResolvers = Pick<Types.AxolotlFundingResolvers, DefinedFields['AxolotlFunding'] | '__isTypeOf'>;
  export type AxolotlFundingPageResolvers = Pick<Types.AxolotlFundingPageResolvers, DefinedFields['AxolotlFundingPage'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    AxolotlFunding?: AxolotlFundingResolvers;
    AxolotlFundingPage?: AxolotlFundingPageResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    AxolotlFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      inscriptionFunding?: gm.Middleware[];
      tokenId?: gm.Middleware[];
      createdAt?: gm.Middleware[];
      originAddress?: gm.Middleware[];
      chameleon?: gm.Middleware[];
    };
    AxolotlFundingPage?: {
      '*'?: gm.Middleware[];
      items?: gm.Middleware[];
      totalCount?: gm.Middleware[];
      page?: gm.Middleware[];
      cursor?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      requestFundingAddress?: gm.Middleware[];
      axolotlFundingAddressRequest?: gm.Middleware[];
    };
  };
}