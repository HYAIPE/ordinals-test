/* eslint-disable */
import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace InscriptionTransactionModule {
  interface DefinedFields {
    InscriptionTransaction: 'inscriptions' | 'overhead' | 'padding' | 'initScript' | 'initTapKey' | 'initLeaf' | 'initCBlock' | 'privateKey';
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
      privateKey?: gm.Middleware[];
    };
  };
}