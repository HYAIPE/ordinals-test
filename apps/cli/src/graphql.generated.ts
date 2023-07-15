import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AxolotlFunding = {
  __typename?: 'AxolotlFunding';
  chameleon: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inscriptionFunding?: Maybe<InscriptionFunding>;
  originAddress: Scalars['String']['output'];
  proof?: Maybe<Scalars['String']['output']>;
  request?: Maybe<Scalars['String']['output']>;
  tokenId: Scalars['Int']['output'];
};

export type AxolotlFundingPage = {
  __typename?: 'AxolotlFundingPage';
  cursor?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<AxolotlFunding>>>;
  page: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type AxolotlRequest = {
  destinationAddress: Scalars['String']['input'];
  feeLevel?: InputMaybe<FeeLevel>;
  feePerByte?: InputMaybe<Scalars['Int']['input']>;
  network: BitcoinNetwork;
  proof?: InputMaybe<Scalars['String']['input']>;
  request?: InputMaybe<Scalars['String']['input']>;
};

export enum BitcoinNetwork {
  Mainnet = 'MAINNET',
  Regtest = 'REGTEST',
  Testnet = 'TESTNET'
}

export type BitcoinScriptItem = {
  __typename?: 'BitcoinScriptItem';
  base64?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export enum BlockchainNetwork {
  Bitcoin = 'BITCOIN',
  Ethereum = 'ETHEREUM'
}

export type Collection = {
  __typename?: 'Collection';
  id: Scalars['ID']['output'];
  maxSupply: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  totalSupply: Scalars['Int']['output'];
};

export type CollectionInput = {
  maxSupply: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export enum FeeLevel {
  Glacial = 'GLACIAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type InscriptionData = {
  __typename?: 'InscriptionData';
  base64Content?: Maybe<Scalars['String']['output']>;
  contentType: Scalars['String']['output'];
  textContent?: Maybe<Scalars['String']['output']>;
};

export type InscriptionDataInput = {
  base64Content?: InputMaybe<Scalars['String']['input']>;
  contentType: Scalars['String']['input'];
  textContent?: InputMaybe<Scalars['String']['input']>;
};

export type InscriptionFunding = {
  __typename?: 'InscriptionFunding';
  fundingAddress: Scalars['String']['output'];
  fundingAmountBtc: Scalars['String']['output'];
  fundingAmountSats: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  inscriptionContent: InscriptionData;
  inscriptionTransaction: InscriptionTransaction;
  network: BitcoinNetwork;
  qrSrc: Scalars['String']['output'];
  qrValue: Scalars['String']['output'];
  s3Object: S3Object;
};


export type InscriptionFundingInscriptionContentArgs = {
  tapKey: Scalars['String']['input'];
};

export type InscriptionRequest = {
  destinationAddress: Scalars['String']['input'];
  feeLevel?: InputMaybe<FeeLevel>;
  feePerByte?: InputMaybe<Scalars['Int']['input']>;
  files: Array<InscriptionDataInput>;
  network: BitcoinNetwork;
};

export type InscriptionTransaction = {
  __typename?: 'InscriptionTransaction';
  initCBlock: Scalars['String']['output'];
  initLeaf: Scalars['String']['output'];
  initScript: Array<BitcoinScriptItem>;
  initTapKey: Scalars['String']['output'];
  inscriptions: Array<InscriptionTransactionContent>;
  overhead: Scalars['Int']['output'];
  padding: Scalars['Int']['output'];
  privateKey: Scalars['String']['output'];
};

export type InscriptionTransactionContent = {
  __typename?: 'InscriptionTransactionContent';
  cblock: Scalars['String']['output'];
  fee: Scalars['Int']['output'];
  leaf: Scalars['String']['output'];
  script: Array<BitcoinScriptItem>;
  tapKey: Scalars['String']['output'];
  txsize: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  axolotlFundingAddressRequest: AxolotlFunding;
  nonceBitcoin: Nonce;
  nonceEthereum: Nonce;
  rbac: MutationRbac;
  requestFundingAddress: InscriptionFunding;
  siwe: Web3LoginUser;
};


export type MutationAxolotlFundingAddressRequestArgs = {
  request: AxolotlRequest;
};


export type MutationNonceBitcoinArgs = {
  address: Scalars['ID']['input'];
};


export type MutationNonceEthereumArgs = {
  address: Scalars['ID']['input'];
  chainId: Scalars['Int']['input'];
};


export type MutationRequestFundingAddressArgs = {
  request: InscriptionRequest;
};


export type MutationSiweArgs = {
  address: Scalars['ID']['input'];
  jwe: Scalars['String']['input'];
};

export type MutationRbac = {
  __typename?: 'MutationRBAC';
  createRole: Role;
};


export type MutationRbacCreateRoleArgs = {
  name: Scalars['String']['input'];
  permissions?: InputMaybe<Array<PermissionInput>>;
};

export type Nonce = {
  __typename?: 'Nonce';
  chainId?: Maybe<Scalars['Int']['output']>;
  domain: Scalars['String']['output'];
  expiration: Scalars['String']['output'];
  issuedAt: Scalars['String']['output'];
  messageToSign: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  pubKey: Scalars['String']['output'];
  uri: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type Permission = {
  __typename?: 'Permission';
  action: PermissionAction;
  identifier?: Maybe<Scalars['String']['output']>;
  resource: PermissionResource;
};

export enum PermissionAction {
  Admin = 'ADMIN',
  Create = 'CREATE',
  Delete = 'DELETE',
  Get = 'GET',
  List = 'LIST',
  Update = 'UPDATE',
  Use = 'USE'
}

export type PermissionInput = {
  action: PermissionAction;
  identifier?: InputMaybe<Scalars['String']['input']>;
  resource: PermissionResource;
};

export enum PermissionResource {
  Admin = 'ADMIN',
  Affiliate = 'AFFILIATE',
  All = 'ALL',
  Presale = 'PRESALE',
  User = 'USER'
}

export type Query = {
  __typename?: 'Query';
  inscriptionFunding?: Maybe<InscriptionFunding>;
  inscriptionTransaction?: Maybe<InscriptionTransaction>;
  userByAddress: Web3User;
};


export type QueryInscriptionFundingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInscriptionTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByAddressArgs = {
  address: Scalars['ID']['input'];
};

export type Role = {
  __typename?: 'Role';
  addPermissions: Role;
  bindToUser: Web3User;
  delete: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Permission>;
  removePermissions: Role;
  unbindFromUser: Web3User;
  userCount: Scalars['Int']['output'];
};


export type RoleAddPermissionsArgs = {
  permissions: Array<PermissionInput>;
};


export type RoleBindToUserArgs = {
  userAddress: Scalars['String']['input'];
};


export type RoleRemovePermissionsArgs = {
  permissions: Array<PermissionInput>;
};


export type RoleUnbindFromUserArgs = {
  userAddress: Scalars['String']['input'];
};

export type S3Object = {
  __typename?: 'S3Object';
  bucket: Scalars['String']['output'];
  key: Scalars['String']['output'];
};

export type Web3LoginUser = {
  __typename?: 'Web3LoginUser';
  address: Scalars['ID']['output'];
  token: Scalars['String']['output'];
  user: Web3User;
};

export type Web3User = {
  __typename?: 'Web3User';
  address: Scalars['ID']['output'];
  allowedActions: Array<Permission>;
  nonce: Scalars['String']['output'];
  roles: Array<Role>;
  type: BlockchainNetwork;
};

export type BitcoinNonceMutationVariables = Exact<{
  address: Scalars['ID']['input'];
}>;


export type BitcoinNonceMutation = { __typename?: 'Mutation', nonceBitcoin: { __typename?: 'Nonce', nonce: string, messageToSign: string, domain: string, expiration: string, issuedAt: string, uri: string, pubKey: string } };

export type EthereumNonceMutationVariables = Exact<{
  address: Scalars['ID']['input'];
  chainId: Scalars['Int']['input'];
}>;


export type EthereumNonceMutation = { __typename?: 'Mutation', nonceEthereum: { __typename?: 'Nonce', nonce: string, messageToSign: string, domain: string, expiration: string, issuedAt: string, uri: string, version?: string | null, pubKey: string } };

export type SiweMutationVariables = Exact<{
  address: Scalars['ID']['input'];
  jwe: Scalars['String']['input'];
}>;


export type SiweMutation = { __typename?: 'Mutation', siwe: { __typename?: 'Web3LoginUser', token: string } };


export const BitcoinNonceDocument = gql`
    mutation BitcoinNonce($address: ID!) {
  nonceBitcoin(address: $address) {
    nonce
    messageToSign
    domain
    expiration
    issuedAt
    uri
    pubKey
  }
}
    `;
export const EthereumNonceDocument = gql`
    mutation EthereumNonce($address: ID!, $chainId: Int!) {
  nonceEthereum(address: $address, chainId: $chainId) {
    nonce
    messageToSign
    domain
    expiration
    issuedAt
    uri
    version
    pubKey
  }
}
    `;
export const SiweDocument = gql`
    mutation SIWE($address: ID!, $jwe: String!) {
  siwe(address: $address, jwe: $jwe) {
    token
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    BitcoinNonce(variables: BitcoinNonceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<BitcoinNonceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<BitcoinNonceMutation>(BitcoinNonceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'BitcoinNonce', 'mutation');
    },
    EthereumNonce(variables: EthereumNonceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<EthereumNonceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EthereumNonceMutation>(EthereumNonceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'EthereumNonce', 'mutation');
    },
    SIWE(variables: SiweMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SiweMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SiweMutation>(SiweDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SIWE', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;