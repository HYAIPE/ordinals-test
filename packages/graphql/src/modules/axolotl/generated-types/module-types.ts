/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace AxolotlModule {
  interface DefinedFields {
    AxolotlFunding: 'id' | 'inscriptionFunding' | 'tokenIds' | 'destinationAddress';
    AxolotlProblem: 'code' | 'message';
    AxolotlOpenEditionResponse: 'problems' | 'funding';
    AxolotlFundingPage: 'items' | 'totalCount' | 'page' | 'cursor';
    AxolotlAvailableClaimedFunding: 'id' | 'destinationAddress' | 'claimingAddress' | 'status' | 'network' | 'funding' | 'tokenId';
    AxolotlAvailableOpenEditionFunding: 'id' | 'destinationAddress' | 'status' | 'network' | 'funding' | 'tokenIds';
    Mutation: 'axolotlFundingOpenEditionRequest';
    Query: 'axolotlAvailableOpenEditionFundingClaims';
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
  export type AxolotlProblem = Pick<Types.AxolotlProblem, DefinedFields['AxolotlProblem']>;
  export type AxolotlOpenEditionResponse = Pick<Types.AxolotlOpenEditionResponse, DefinedFields['AxolotlOpenEditionResponse']>;
  export type AxolotlFundingPage = Pick<Types.AxolotlFundingPage, DefinedFields['AxolotlFundingPage']>;
  export type AxolotlAvailableClaimedRequest = Pick<Types.AxolotlAvailableClaimedRequest, DefinedInputFields['AxolotlAvailableClaimedRequest']>;
  export type AxolotlAvailableOpenEditionRequest = Pick<Types.AxolotlAvailableOpenEditionRequest, DefinedInputFields['AxolotlAvailableOpenEditionRequest']>;
  export type FundingStatus = DefinedEnumValues['FundingStatus'];
  export type AxolotlAvailableClaimedFunding = Pick<Types.AxolotlAvailableClaimedFunding, DefinedFields['AxolotlAvailableClaimedFunding']>;
  export type AxolotlAvailableOpenEditionFunding = Pick<Types.AxolotlAvailableOpenEditionFunding, DefinedFields['AxolotlAvailableOpenEditionFunding']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type AxolotlFundingResolvers = Pick<Types.AxolotlFundingResolvers, DefinedFields['AxolotlFunding'] | '__isTypeOf'>;
  export type AxolotlProblemResolvers = Pick<Types.AxolotlProblemResolvers, DefinedFields['AxolotlProblem'] | '__isTypeOf'>;
  export type AxolotlOpenEditionResponseResolvers = Pick<Types.AxolotlOpenEditionResponseResolvers, DefinedFields['AxolotlOpenEditionResponse'] | '__isTypeOf'>;
  export type AxolotlFundingPageResolvers = Pick<Types.AxolotlFundingPageResolvers, DefinedFields['AxolotlFundingPage'] | '__isTypeOf'>;
  export type AxolotlAvailableClaimedFundingResolvers = Pick<Types.AxolotlAvailableClaimedFundingResolvers, DefinedFields['AxolotlAvailableClaimedFunding'] | '__isTypeOf'>;
  export type AxolotlAvailableOpenEditionFundingResolvers = Pick<Types.AxolotlAvailableOpenEditionFundingResolvers, DefinedFields['AxolotlAvailableOpenEditionFunding'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    AxolotlFunding?: AxolotlFundingResolvers;
    AxolotlProblem?: AxolotlProblemResolvers;
    AxolotlOpenEditionResponse?: AxolotlOpenEditionResponseResolvers;
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
      tokenIds?: gm.Middleware[];
      destinationAddress?: gm.Middleware[];
    };
    AxolotlProblem?: {
      '*'?: gm.Middleware[];
      code?: gm.Middleware[];
      message?: gm.Middleware[];
    };
    AxolotlOpenEditionResponse?: {
      '*'?: gm.Middleware[];
      problems?: gm.Middleware[];
      funding?: gm.Middleware[];
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
      tokenIds?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      axolotlFundingOpenEditionRequest?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      axolotlAvailableOpenEditionFundingClaims?: gm.Middleware[];
    };
  };
}