/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace PermissionsModule {
  interface DefinedFields {
    Permission: 'action' | 'resource' | 'identifier';
    Role: 'id' | 'name' | 'userCount' | 'permissions' | 'bindToUser' | 'unbindFromUser' | 'addPermissions' | 'removePermissions' | 'delete';
    Query: 'role' | 'roles';
    Mutation: 'createRole' | 'role';
  };
  
  interface DefinedEnumValues {
    PermissionAction: 'CREATE' | 'UPDATE' | 'DELETE' | 'LIST' | 'GET' | 'USE' | 'ADMIN';
    PermissionResource: 'ALL' | 'USER' | 'ADMIN' | 'ROLE' | 'PRESALE' | 'AFFILIATE' | 'COLLECTION';
  };
  
  interface DefinedInputFields {
    PermissionInput: 'action' | 'resource' | 'identifier';
  };
  
  export type PermissionAction = DefinedEnumValues['PermissionAction'];
  export type PermissionResource = DefinedEnumValues['PermissionResource'];
  export type Permission = Pick<Types.Permission, DefinedFields['Permission']>;
  export type PermissionInput = Pick<Types.PermissionInput, DefinedInputFields['PermissionInput']>;
  export type Role = Pick<Types.Role, DefinedFields['Role']>;
  export type Web3User = Types.Web3User;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type PermissionResolvers = Pick<Types.PermissionResolvers, DefinedFields['Permission'] | '__isTypeOf'>;
  export type RoleResolvers = Pick<Types.RoleResolvers, DefinedFields['Role'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Permission?: PermissionResolvers;
    Role?: RoleResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Permission?: {
      '*'?: gm.Middleware[];
      action?: gm.Middleware[];
      resource?: gm.Middleware[];
      identifier?: gm.Middleware[];
    };
    Role?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      name?: gm.Middleware[];
      userCount?: gm.Middleware[];
      permissions?: gm.Middleware[];
      bindToUser?: gm.Middleware[];
      unbindFromUser?: gm.Middleware[];
      addPermissions?: gm.Middleware[];
      removePermissions?: gm.Middleware[];
      delete?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      role?: gm.Middleware[];
      roles?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      createRole?: gm.Middleware[];
      role?: gm.Middleware[];
    };
  };
}