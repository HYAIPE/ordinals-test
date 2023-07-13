/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace QueryModule {
  interface DefinedFields {
    Query: 'inscriptionTransaction' | 'inscriptionFunding';
  };
  
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type InscriptionTransaction = Types.InscriptionTransaction;
  export type InscriptionFunding = Types.InscriptionFunding;
  
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      inscriptionTransaction?: gm.Middleware[];
      inscriptionFunding?: gm.Middleware[];
    };
  };
}