/* eslint-disable */
import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace BitcoinModule {
  interface DefinedFields {
    BitcoinScriptItem: 'text' | 'base64';
  };
  
  interface DefinedEnumValues {
    BitcoinNetwork: 'MAINNET' | 'TESTNET' | 'REGTEST';
  };
  
  export type BitcoinScriptItem = Pick<Types.BitcoinScriptItem, DefinedFields['BitcoinScriptItem']>;
  export type BitcoinNetwork = DefinedEnumValues['BitcoinNetwork'];
  
  export type BitcoinScriptItemResolvers = Pick<Types.BitcoinScriptItemResolvers, DefinedFields['BitcoinScriptItem'] | '__isTypeOf'>;
  
  export interface Resolvers {
    BitcoinScriptItem?: BitcoinScriptItemResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    BitcoinScriptItem?: {
      '*'?: gm.Middleware[];
      text?: gm.Middleware[];
      base64?: gm.Middleware[];
    };
  };
}