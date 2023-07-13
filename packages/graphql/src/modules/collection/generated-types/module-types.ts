/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace CollectionModule {
  interface DefinedFields {
    Collection: 'id' | 'name' | 'maxSupply' | 'totalSupply';
  };
  
  interface DefinedInputFields {
    CollectionInput: 'name' | 'maxSupply';
  };
  
  export type Collection = Pick<Types.Collection, DefinedFields['Collection']>;
  export type CollectionInput = Pick<Types.CollectionInput, DefinedInputFields['CollectionInput']>;
  
  export type CollectionResolvers = Pick<Types.CollectionResolvers, DefinedFields['Collection'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Collection?: CollectionResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Collection?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      name?: gm.Middleware[];
      maxSupply?: gm.Middleware[];
      totalSupply?: gm.Middleware[];
    };
  };
}