/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace CollectionsModule {
  interface DefinedFields {
    KeyValue: 'key' | 'value';
    Collection: 'id' | 'name' | 'totalCount' | 'maxSupply' | 'metadata' | 'updateMetadata';
    Mutation: 'createCollection' | 'deleteCollection' | 'collection';
    Query: 'collections' | 'collection';
  };
  
  interface DefinedInputFields {
    KeyValueInput: 'key' | 'value';
    CollectionInput: 'name' | 'maxSupply' | 'meta';
  };
  
  export type KeyValue = Pick<Types.KeyValue, DefinedFields['KeyValue']>;
  export type KeyValueInput = Pick<Types.KeyValueInput, DefinedInputFields['KeyValueInput']>;
  export type Collection = Pick<Types.Collection, DefinedFields['Collection']>;
  export type CollectionInput = Pick<Types.CollectionInput, DefinedInputFields['CollectionInput']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type KeyValueResolvers = Pick<Types.KeyValueResolvers, DefinedFields['KeyValue'] | '__isTypeOf'>;
  export type CollectionResolvers = Pick<Types.CollectionResolvers, DefinedFields['Collection'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    KeyValue?: KeyValueResolvers;
    Collection?: CollectionResolvers;
    Mutation?: MutationResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    KeyValue?: {
      '*'?: gm.Middleware[];
      key?: gm.Middleware[];
      value?: gm.Middleware[];
    };
    Collection?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      name?: gm.Middleware[];
      totalCount?: gm.Middleware[];
      maxSupply?: gm.Middleware[];
      metadata?: gm.Middleware[];
      updateMetadata?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      createCollection?: gm.Middleware[];
      deleteCollection?: gm.Middleware[];
      collection?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      collections?: gm.Middleware[];
      collection?: gm.Middleware[];
    };
  };
}