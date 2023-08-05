/* eslint-disable */
import type * as Types from "../../../generated-types/graphql.js";
import type * as gm from "@0xflick/graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    Nonce: 'nonce' | 'messageToSign' | 'domain' | 'expiration' | 'issuedAt' | 'uri' | 'version' | 'chainId' | 'pubKey';
    Web3User: 'address' | 'type' | 'roles' | 'allowedActions' | 'token';
    Web3LoginUser: 'address' | 'user' | 'token';
    Mutation: 'nonceEthereum' | 'nonceBitcoin';
  };
  
  export type Nonce = Pick<Types.Nonce, DefinedFields['Nonce']>;
  export type Web3User = Pick<Types.Web3User, DefinedFields['Web3User']>;
  export type BlockchainNetwork = Types.BlockchainNetwork;
  export type Role = Types.Role;
  export type Permission = Types.Permission;
  export type Web3LoginUser = Pick<Types.Web3LoginUser, DefinedFields['Web3LoginUser']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type NonceResolvers = Pick<Types.NonceResolvers, DefinedFields['Nonce'] | '__isTypeOf'>;
  export type Web3UserResolvers = Pick<Types.Web3UserResolvers, DefinedFields['Web3User'] | '__isTypeOf'>;
  export type Web3LoginUserResolvers = Pick<Types.Web3LoginUserResolvers, DefinedFields['Web3LoginUser'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Nonce?: NonceResolvers;
    Web3User?: Web3UserResolvers;
    Web3LoginUser?: Web3LoginUserResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Nonce?: {
      '*'?: gm.Middleware[];
      nonce?: gm.Middleware[];
      messageToSign?: gm.Middleware[];
      domain?: gm.Middleware[];
      expiration?: gm.Middleware[];
      issuedAt?: gm.Middleware[];
      uri?: gm.Middleware[];
      version?: gm.Middleware[];
      chainId?: gm.Middleware[];
      pubKey?: gm.Middleware[];
    };
    Web3User?: {
      '*'?: gm.Middleware[];
      address?: gm.Middleware[];
      type?: gm.Middleware[];
      roles?: gm.Middleware[];
      allowedActions?: gm.Middleware[];
      token?: gm.Middleware[];
    };
    Web3LoginUser?: {
      '*'?: gm.Middleware[];
      address?: gm.Middleware[];
      user?: gm.Middleware[];
      token?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      nonceEthereum?: gm.Middleware[];
      nonceBitcoin?: gm.Middleware[];
    };
  };
}