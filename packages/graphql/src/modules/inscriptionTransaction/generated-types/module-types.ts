/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace InscriptionTransactionModule {
  interface DefinedFields {
    InscriptionTransaction: 'inscriptions' | 'overhead' | 'padding' | 'initScript' | 'initTapKey' | 'initLeaf' | 'initCBlock' | 'count';
  };
  
  export type InscriptionTransaction = Pick<Types.InscriptionTransaction, DefinedFields['InscriptionTransaction']>;
  export type InscriptionTransactionContent = Types.InscriptionTransactionContent;
  export type BitcoinScriptItem = Types.BitcoinScriptItem;
  
  export type InscriptionTransactionResolvers = Pick<Types.InscriptionTransactionResolvers, DefinedFields['InscriptionTransaction'] | '__isTypeOf'>;
  
  export interface Resolvers {
    InscriptionTransaction?: InscriptionTransactionResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    InscriptionTransaction?: {
      '*'?: gm.Middleware[];
      inscriptions?: gm.Middleware[];
      overhead?: gm.Middleware[];
      padding?: gm.Middleware[];
      initScript?: gm.Middleware[];
      initTapKey?: gm.Middleware[];
      initLeaf?: gm.Middleware[];
      initCBlock?: gm.Middleware[];
      count?: gm.Middleware[];
    };
  };
}