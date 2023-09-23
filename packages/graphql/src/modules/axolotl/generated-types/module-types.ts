/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace AxolotlModule {
  interface DefinedFields {
    AxolotlFunding: 'id' | 'inscriptionFunding' | 'tokenId' | 'createdAt' | 'originAddress' | 'chameleon';
    AxolotlFundingPage: 'items' | 'totalCount' | 'page' | 'cursor';
    AxolotlAvailableFunding: 'id' | 'destinationAddress' | 'claimingAddress' | 'status' | 'network' | 'funding';
    Mutation: 'requestFundingAddress' | 'axolotlFundingAddressRequest' | 'axolotlAvailableFundingAddresses';
  };
  
  interface DefinedEnumValues {
    FundingStatus: 'UNVERIFIED' | 'UNCLAIMED' | 'FUNDING' | 'FUNDED' | 'GENESIS' | 'REVEAL';
  };
  
  interface DefinedInputFields {
    AxolotlRequest: 'claimingAddress' | 'network' | 'feeLevel' | 'feePerByte' | 'collectionId';
    AxolotlAvailableFundingRequest: 'claimingAddress' | 'collectionId';
  };
  
  export type AxolotlRequest = Pick<Types.AxolotlRequest, DefinedInputFields['AxolotlRequest']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type FeeLevel = Types.FeeLevel;
  export type AxolotlFunding = Pick<Types.AxolotlFunding, DefinedFields['AxolotlFunding']>;
  export type InscriptionFunding = Types.InscriptionFunding;
  export type AxolotlFundingPage = Pick<Types.AxolotlFundingPage, DefinedFields['AxolotlFundingPage']>;
  export type AxolotlAvailableFundingRequest = Pick<Types.AxolotlAvailableFundingRequest, DefinedInputFields['AxolotlAvailableFundingRequest']>;
  export type FundingStatus = DefinedEnumValues['FundingStatus'];
  export type AxolotlAvailableFunding = Pick<Types.AxolotlAvailableFunding, DefinedFields['AxolotlAvailableFunding']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type InscriptionRequest = Types.InscriptionRequest;
  
  export type AxolotlFundingResolvers = Pick<Types.AxolotlFundingResolvers, DefinedFields['AxolotlFunding'] | '__isTypeOf'>;
  export type AxolotlFundingPageResolvers = Pick<Types.AxolotlFundingPageResolvers, DefinedFields['AxolotlFundingPage'] | '__isTypeOf'>;
  export type AxolotlAvailableFundingResolvers = Pick<Types.AxolotlAvailableFundingResolvers, DefinedFields['AxolotlAvailableFunding'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    AxolotlFunding?: AxolotlFundingResolvers;
    AxolotlFundingPage?: AxolotlFundingPageResolvers;
    AxolotlAvailableFunding?: AxolotlAvailableFundingResolvers;
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
    AxolotlAvailableFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      destinationAddress?: gm.Middleware[];
      claimingAddress?: gm.Middleware[];
      status?: gm.Middleware[];
      network?: gm.Middleware[];
      funding?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      requestFundingAddress?: gm.Middleware[];
      axolotlFundingAddressRequest?: gm.Middleware[];
      axolotlAvailableFundingAddresses?: gm.Middleware[];
    };
  };
}