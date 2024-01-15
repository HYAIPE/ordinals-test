/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace InscriptionFundingModule {
  interface DefinedFields {
    InscriptionFunding: 'id' | 'fundingAmountBtc' | 'fundingAmountSats' | 'fundingAddress' | 'network' | 'qrValue' | 'qrSrc' | 'inscriptionTransaction' | 'status' | 'fundingTxId' | 'fundingTxUrl' | 'fundingGenesisTxId' | 'fundingGenesisTxUrl' | 'fundingRevealTxIds' | 'fundingRevealTxUrls' | 'inscriptionContent';
    Query: 'inscriptionFunding';
  };
  
  interface DefinedEnumValues {
    FundingStatus: 'FUNDING' | 'FUNDED' | 'GENESIS' | 'REVEALED';
  };
  
  export type FundingStatus = DefinedEnumValues['FundingStatus'];
  export type InscriptionFunding = Pick<Types.InscriptionFunding, DefinedFields['InscriptionFunding']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type InscriptionTransaction = Types.InscriptionTransaction;
  export type InscriptionData = Types.InscriptionData;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type InscriptionFundingResolvers = Pick<Types.InscriptionFundingResolvers, DefinedFields['InscriptionFunding'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    InscriptionFunding?: InscriptionFundingResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    InscriptionFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      fundingAmountBtc?: gm.Middleware[];
      fundingAmountSats?: gm.Middleware[];
      fundingAddress?: gm.Middleware[];
      network?: gm.Middleware[];
      qrValue?: gm.Middleware[];
      qrSrc?: gm.Middleware[];
      inscriptionTransaction?: gm.Middleware[];
      status?: gm.Middleware[];
      fundingTxId?: gm.Middleware[];
      fundingTxUrl?: gm.Middleware[];
      fundingGenesisTxId?: gm.Middleware[];
      fundingGenesisTxUrl?: gm.Middleware[];
      fundingRevealTxIds?: gm.Middleware[];
      fundingRevealTxUrls?: gm.Middleware[];
      inscriptionContent?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      inscriptionFunding?: gm.Middleware[];
    };
  };
}