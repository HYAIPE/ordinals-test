/* eslint-disable */
import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace InscriptionFundingModule {
  interface DefinedFields {
    S3Object: 'bucket' | 'key';
    InscriptionFunding: 'id' | 's3Object' | 'fundingAmountBtc' | 'fundingAddress' | 'network' | 'totalFee' | 'qrValue' | 'qrSrc' | 'inscriptionTransaction' | 'overhead' | 'padding' | 'inscriptionContent';
  };
  
  export type S3Object = Pick<Types.S3Object, DefinedFields['S3Object']>;
  export type InscriptionFunding = Pick<Types.InscriptionFunding, DefinedFields['InscriptionFunding']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  export type InscriptionTransaction = Types.InscriptionTransaction;
  export type InscriptionData = Types.InscriptionData;
  
  export type S3ObjectResolvers = Pick<Types.S3ObjectResolvers, DefinedFields['S3Object'] | '__isTypeOf'>;
  export type InscriptionFundingResolvers = Pick<Types.InscriptionFundingResolvers, DefinedFields['InscriptionFunding'] | '__isTypeOf'>;
  
  export interface Resolvers {
    S3Object?: S3ObjectResolvers;
    InscriptionFunding?: InscriptionFundingResolvers;
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
      fundingAddress?: gm.Middleware[];
      network?: gm.Middleware[];
      totalFee?: gm.Middleware[];
      qrValue?: gm.Middleware[];
      qrSrc?: gm.Middleware[];
      inscriptionTransaction?: gm.Middleware[];
      overhead?: gm.Middleware[];
      padding?: gm.Middleware[];
      overhead?: gm.Middleware[];
      padding?: gm.Middleware[];
      inscriptionContent?: gm.Middleware[];
    };
  };
}