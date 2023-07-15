/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace InscriptionRequestModule {
  interface DefinedFields {
    InscriptionTransactionContent: 'leaf' | 'tapKey' | 'cblock' | 'txsize' | 'fee' | 'script';
    InscriptionData: 'textContent' | 'base64Content' | 'contentType';
  };
  
  interface DefinedEnumValues {
    FeeLevel: 'GLACIAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  interface DefinedInputFields {
    InscriptionDataInput: 'textContent' | 'base64Content' | 'contentType';
    InscriptionRequest: 'files' | 'destinationAddress' | 'network' | 'feeLevel' | 'feePerByte';
  };
  
  export type InscriptionTransactionContent = Pick<Types.InscriptionTransactionContent, DefinedFields['InscriptionTransactionContent']>;
  export type BitcoinScriptItem = Types.BitcoinScriptItem;
  export type InscriptionData = Pick<Types.InscriptionData, DefinedFields['InscriptionData']>;
  export type FeeLevel = DefinedEnumValues['FeeLevel'];
  export type InscriptionDataInput = Pick<Types.InscriptionDataInput, DefinedInputFields['InscriptionDataInput']>;
  export type InscriptionRequest = Pick<Types.InscriptionRequest, DefinedInputFields['InscriptionRequest']>;
  export type BitcoinNetwork = Types.BitcoinNetwork;
  
  export type InscriptionTransactionContentResolvers = Pick<Types.InscriptionTransactionContentResolvers, DefinedFields['InscriptionTransactionContent'] | '__isTypeOf'>;
  export type InscriptionDataResolvers = Pick<Types.InscriptionDataResolvers, DefinedFields['InscriptionData'] | '__isTypeOf'>;
  
  export interface Resolvers {
    InscriptionTransactionContent?: InscriptionTransactionContentResolvers;
    InscriptionData?: InscriptionDataResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    InscriptionTransactionContent?: {
      '*'?: gm.Middleware[];
      leaf?: gm.Middleware[];
      tapKey?: gm.Middleware[];
      cblock?: gm.Middleware[];
      txsize?: gm.Middleware[];
      fee?: gm.Middleware[];
      script?: gm.Middleware[];
    };
    InscriptionData?: {
      '*'?: gm.Middleware[];
      textContent?: gm.Middleware[];
      base64Content?: gm.Middleware[];
      contentType?: gm.Middleware[];
    };
  };
}