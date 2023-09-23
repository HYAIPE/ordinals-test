/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace InscriptionFundingModule {
  interface DefinedFields {
    S3Object: 'bucket' | 'key';
    InscriptionFunding: 'id' | 's3Object' | 'fundingAmountBtc' | 'fundingAmountSats' | 'fundingAddress' | 'network' | 'qrValue' | 'qrSrc' | 'inscriptionTransaction' | 'inscriptionContent';
    Query: 'inscriptionFunding';
  };
  
  export type S3Object = Pick<Types.S3Object, DefinedFields['S3Object']>;
  export type InscriptionFunding = Pick<Types.InscriptionFunding, DefinedFields['InscriptionFunding']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type InscriptionTransaction = Types.InscriptionTransaction;
  export type InscriptionData = Types.InscriptionData;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type S3ObjectResolvers = Pick<Types.S3ObjectResolvers, DefinedFields['S3Object'] | '__isTypeOf'>;
  export type InscriptionFundingResolvers = Pick<Types.InscriptionFundingResolvers, DefinedFields['InscriptionFunding'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    S3Object?: S3ObjectResolvers;
    InscriptionFunding?: InscriptionFundingResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    S3Object?: {
      '*'?: gm.Middleware[];
      bucket?: gm.Middleware[];
      key?: gm.Middleware[];
    };
    InscriptionFunding?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      s3Object?: gm.Middleware[];
      fundingAmountBtc?: gm.Middleware[];
      fundingAmountSats?: gm.Middleware[];
      fundingAddress?: gm.Middleware[];
      network?: gm.Middleware[];
      qrValue?: gm.Middleware[];
      qrSrc?: gm.Middleware[];
      inscriptionTransaction?: gm.Middleware[];
      inscriptionContent?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      inscriptionFunding?: gm.Middleware[];
    };
  };
}