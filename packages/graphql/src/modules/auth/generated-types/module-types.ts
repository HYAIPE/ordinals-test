/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace AuthModule {
  interface DefinedFields {
    AppInfo: 'name' | 'pubKey';
    Query: 'appInfo' | 'self';
    Mutation: 'siwe' | 'siwb' | 'signOutEthereum' | 'signOutBitcoin';
  };
  
  export type AppInfo = Pick<Types.AppInfo, DefinedFields['AppInfo']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Web3User = Types.Web3User;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Web3LoginUser = Types.Web3LoginUser;
  
  export type AppInfoResolvers = Pick<Types.AppInfoResolvers, DefinedFields['AppInfo'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    AppInfo?: AppInfoResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    AppInfo?: {
      '*'?: gm.Middleware[];
      name?: gm.Middleware[];
      pubKey?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      appInfo?: gm.Middleware[];
      self?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      siwe?: gm.Middleware[];
      siwb?: gm.Middleware[];
      signOutEthereum?: gm.Middleware[];
      signOutBitcoin?: gm.Middleware[];
    };
  };
}