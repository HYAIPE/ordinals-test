/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace AxolotlModule {
  interface DefinedFields {
    AxolotlFunding: 'id' | 'inscriptionFunding' | 'tokenId' | 'createdAt' | 'destinationAddress' | 'chameleon';
    AxolotlFundingPage: 'items' | 'totalCount' | 'page' | 'cursor';
    AxolotlAvailableClaimedFunding: 'id' | 'destinationAddress' | 'claimingAddress' | 'status' | 'network' | 'funding' | 'tokenId';
    AxolotlAvailableOpenEditionFunding: 'id' | 'destinationAddress' | 'status' | 'network' | 'funding' | 'tokenId';
    Mutation: 'requestFundingAddress' | 'axolotlFundingClaimRequest' | 'axolotlFundingOpenEditionRequest';
    Query: 'axolotlAvailableClaimedFundingClaims' | 'axolotlAvailableOpenEditionFundingClaims';
  };
  
  interface DefinedEnumValues {
    FundingStatus: 'UNVERIFIED' | 'UNCLAIMED' | 'FUNDING' | 'FUNDED' | 'GENESIS' | 'REVEAL';
  };
  
  interface DefinedInputFields {
    AxolotlClaimRequest: 'claimingAddress' | 'network' | 'feeLevel' | 'feePerByte' | 'collectionId';
    AxolotlOpenEditionRequest: 'destinationAddress' | 'claimCount' | 'network' | 'feeLevel' | 'feePerByte' | 'collectionId';
    AxolotlAvailableClaimedRequest: 'claimingAddress' | 'collectionId';
    AxolotlAvailableOpenEditionRequest: 'destinationAddress' | 'collectionId';
  };
  
  export type AxolotlClaimRequest = Pick<Types.AxolotlClaimRequest, DefinedInputFields['AxolotlClaimRequest']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type FeeLevel = Types.FeeLevel;
  export type AxolotlOpenEditionRequest = Pick<Types.AxolotlOpenEditionRequest, DefinedInputFields['AxolotlOpenEditionRequest']>;
  export type AxolotlFunding = Pick<Types.AxolotlFunding, DefinedFields['AxolotlFunding']>;
  export type InscriptionFunding = Types.InscriptionFunding;
  export type AxolotlFundingPage = Pick<Types.AxolotlFundingPage, DefinedFields['AxolotlFundingPage']>;
  export type AxolotlAvailableClaimedRequest = Pick<Types.AxolotlAvailableClaimedRequest, DefinedInputFields['AxolotlAvailableClaimedRequest']>;
  export type AxolotlAvailableOpenEditionRequest = Pick<Types.AxolotlAvailableOpenEditionRequest, DefinedInputFields['AxolotlAvailableOpenEditionRequest']>;
  export type FundingStatus = DefinedEnumValues['FundingStatus'];
  export type AxolotlAvailableClaimedFunding = Pick<Types.AxolotlAvailableClaimedFunding, DefinedFields['AxolotlAvailableClaimedFunding']>;
  export type AxolotlAvailableOpenEditionFunding = Pick<Types.AxolotlAvailableOpenEditionFunding, DefinedFields['AxolotlAvailableOpenEditionFunding']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type InscriptionRequest = Types.InscriptionRequest;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type AxolotlFundingResolvers = Pick<Types.AxolotlFundingResolvers, DefinedFields['AxolotlFunding'] | '__isTypeOf'>;
  export type AxolotlFundingPageResolvers = Pick<Types.AxolotlFundingPageResolvers, DefinedFields['AxolotlFundingPage'] | '__isTypeOf'>;
  export type AxolotlAvailableClaimedFundingResolvers = Pick<Types.AxolotlAvailableClaimedFundingResolvers, DefinedFields['AxolotlAvailableClaimedFunding'] | '__isTypeOf'>;
  export type AxolotlAvailableOpenEditionFundingResolvers = Pick<Types.AxolotlAvailableOpenEditionFundingResolvers, DefinedFields['AxolotlAvailableOpenEditionFunding'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    AxolotlFunding?: AxolotlFundingResolvers;
    AxolotlFundingPage?: AxolotlFundingPageResolvers;
    AxolotlAvailableClaimedFunding?: AxolotlAvailableClaimedFundingResolvers;
    AxolotlAvailableOpenEditionFunding?: AxolotlAvailableOpenEditionFundingResolvers;
    Mutation?: MutationResolvers;
    Query?: QueryResolvers;
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
      destinationAddress?: gm.Middleware[];
      chameleon?: gm.Middleware[];
    };
    AxolotlFundingPage?: {
      '*'?: gm.Middleware[];
      items?: gm.Middleware[];
      totalCount?: gm.Middleware[];
      page?: gm.Middleware[];
      cursor?: gm.Middleware[];
    };
    AxolotlAvailableClaimedFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      destinationAddress?: gm.Middleware[];
      claimingAddress?: gm.Middleware[];
      status?: gm.Middleware[];
      network?: gm.Middleware[];
      funding?: gm.Middleware[];
      tokenId?: gm.Middleware[];
    };
    AxolotlAvailableOpenEditionFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      destinationAddress?: gm.Middleware[];
      status?: gm.Middleware[];
      network?: gm.Middleware[];
      funding?: gm.Middleware[];
      tokenId?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      requestFundingAddress?: gm.Middleware[];
      axolotlFundingClaimRequest?: gm.Middleware[];
      axolotlFundingOpenEditionRequest?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      axolotlAvailableClaimedFundingClaims?: gm.Middleware[];
      axolotlAvailableOpenEditionFundingClaims?: gm.Middleware[];
    };
  };
}