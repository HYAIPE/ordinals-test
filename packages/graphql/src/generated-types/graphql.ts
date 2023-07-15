/* eslint-disable */
import type { GraphQLResolveInfo } from 'graphql';
import type { InscriptionTransactionModel } from '../modules/inscriptionTransaction/models.js';
import type { InscriptionFundingModel } from '../modules/inscriptionFunding/models.js';
import type { InscriptionTransactionContentModel } from '../modules/inscriptionRequest/models.js';
import type { RoleModel } from '../modules/permissions/models.js';
import type { Web3UserModel, Web3LoginUserModel } from '../modules/user/models.js';
import type { Context } from '../context/index.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type BitcoinNetwork =
  | 'MAINNET'
  | 'REGTEST'
  | 'TESTNET';

export type BitcoinScriptItem = {
  __typename?: 'BitcoinScriptItem';
  base64?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type BlockchainNetwork =
  | 'BITCOIN'
  | 'ETHEREUM';

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

export type FeeLevel =
  | 'GLACIAL'
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

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

export type PermissionAction =
  | 'ADMIN'
  | 'CREATE'
  | 'DELETE'
  | 'GET'
  | 'LIST'
  | 'UPDATE'
  | 'USE';

export type PermissionInput = {
  action: PermissionAction;
  identifier?: InputMaybe<Scalars['String']['input']>;
  resource: PermissionResource;
};

export type PermissionResource =
  | 'ADMIN'
  | 'AFFILIATE'
  | 'ALL'
  | 'PRESALE'
  | 'USER';

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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AxolotlFunding: ResolverTypeWrapper<Omit<AxolotlFunding, 'inscriptionFunding'> & { inscriptionFunding?: Maybe<ResolversTypes['InscriptionFunding']> }>;
  AxolotlFundingPage: ResolverTypeWrapper<Omit<AxolotlFundingPage, 'items'> & { items?: Maybe<Array<Maybe<ResolversTypes['AxolotlFunding']>>> }>;
  AxolotlRequest: AxolotlRequest;
  BitcoinNetwork: BitcoinNetwork;
  BitcoinScriptItem: ResolverTypeWrapper<BitcoinScriptItem>;
  BlockchainNetwork: BlockchainNetwork;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Collection: ResolverTypeWrapper<Collection>;
  CollectionInput: CollectionInput;
  FeeLevel: FeeLevel;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  InscriptionData: ResolverTypeWrapper<InscriptionData>;
  InscriptionDataInput: InscriptionDataInput;
  InscriptionFunding: ResolverTypeWrapper<InscriptionFundingModel>;
  InscriptionRequest: InscriptionRequest;
  InscriptionTransaction: ResolverTypeWrapper<InscriptionTransactionModel>;
  InscriptionTransactionContent: ResolverTypeWrapper<InscriptionTransactionContentModel>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  MutationRBAC: ResolverTypeWrapper<Omit<MutationRbac, 'createRole'> & { createRole: ResolversTypes['Role'] }>;
  Nonce: ResolverTypeWrapper<Nonce>;
  Permission: ResolverTypeWrapper<Permission>;
  PermissionAction: PermissionAction;
  PermissionInput: PermissionInput;
  PermissionResource: PermissionResource;
  Query: ResolverTypeWrapper<{}>;
  Role: ResolverTypeWrapper<RoleModel>;
  S3Object: ResolverTypeWrapper<S3Object>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Web3LoginUser: ResolverTypeWrapper<Web3LoginUserModel>;
  Web3User: ResolverTypeWrapper<Web3UserModel>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AxolotlFunding: Omit<AxolotlFunding, 'inscriptionFunding'> & { inscriptionFunding?: Maybe<ResolversParentTypes['InscriptionFunding']> };
  AxolotlFundingPage: Omit<AxolotlFundingPage, 'items'> & { items?: Maybe<Array<Maybe<ResolversParentTypes['AxolotlFunding']>>> };
  AxolotlRequest: AxolotlRequest;
  BitcoinScriptItem: BitcoinScriptItem;
  Boolean: Scalars['Boolean']['output'];
  Collection: Collection;
  CollectionInput: CollectionInput;
  ID: Scalars['ID']['output'];
  InscriptionData: InscriptionData;
  InscriptionDataInput: InscriptionDataInput;
  InscriptionFunding: InscriptionFundingModel;
  InscriptionRequest: InscriptionRequest;
  InscriptionTransaction: InscriptionTransactionModel;
  InscriptionTransactionContent: InscriptionTransactionContentModel;
  Int: Scalars['Int']['output'];
  Mutation: {};
  MutationRBAC: Omit<MutationRbac, 'createRole'> & { createRole: ResolversParentTypes['Role'] };
  Nonce: Nonce;
  Permission: Permission;
  PermissionInput: PermissionInput;
  Query: {};
  Role: RoleModel;
  S3Object: S3Object;
  String: Scalars['String']['output'];
  Web3LoginUser: Web3LoginUserModel;
  Web3User: Web3UserModel;
};

export type AxolotlFundingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AxolotlFunding'] = ResolversParentTypes['AxolotlFunding']> = {
  chameleon?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inscriptionFunding?: Resolver<Maybe<ResolversTypes['InscriptionFunding']>, ParentType, ContextType>;
  originAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  proof?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  request?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AxolotlFundingPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AxolotlFundingPage'] = ResolversParentTypes['AxolotlFundingPage']> = {
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['AxolotlFunding']>>>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BitcoinScriptItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BitcoinScriptItem'] = ResolversParentTypes['BitcoinScriptItem']> = {
  base64?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CollectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxSupply?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalSupply?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InscriptionDataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InscriptionData'] = ResolversParentTypes['InscriptionData']> = {
  base64Content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  textContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InscriptionFundingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InscriptionFunding'] = ResolversParentTypes['InscriptionFunding']> = {
  fundingAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fundingAmountBtc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fundingAmountSats?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inscriptionContent?: Resolver<ResolversTypes['InscriptionData'], ParentType, ContextType, RequireFields<InscriptionFundingInscriptionContentArgs, 'tapKey'>>;
  inscriptionTransaction?: Resolver<ResolversTypes['InscriptionTransaction'], ParentType, ContextType>;
  network?: Resolver<ResolversTypes['BitcoinNetwork'], ParentType, ContextType>;
  qrSrc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  qrValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3Object?: Resolver<ResolversTypes['S3Object'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InscriptionTransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InscriptionTransaction'] = ResolversParentTypes['InscriptionTransaction']> = {
  initCBlock?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initLeaf?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initScript?: Resolver<Array<ResolversTypes['BitcoinScriptItem']>, ParentType, ContextType>;
  initTapKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  inscriptions?: Resolver<Array<ResolversTypes['InscriptionTransactionContent']>, ParentType, ContextType>;
  overhead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  padding?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  privateKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InscriptionTransactionContentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InscriptionTransactionContent'] = ResolversParentTypes['InscriptionTransactionContent']> = {
  cblock?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fee?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  leaf?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  script?: Resolver<Array<ResolversTypes['BitcoinScriptItem']>, ParentType, ContextType>;
  tapKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  txsize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  axolotlFundingAddressRequest?: Resolver<ResolversTypes['AxolotlFunding'], ParentType, ContextType, RequireFields<MutationAxolotlFundingAddressRequestArgs, 'request'>>;
  nonceBitcoin?: Resolver<ResolversTypes['Nonce'], ParentType, ContextType, RequireFields<MutationNonceBitcoinArgs, 'address'>>;
  nonceEthereum?: Resolver<ResolversTypes['Nonce'], ParentType, ContextType, RequireFields<MutationNonceEthereumArgs, 'address' | 'chainId'>>;
  rbac?: Resolver<ResolversTypes['MutationRBAC'], ParentType, ContextType>;
  requestFundingAddress?: Resolver<ResolversTypes['InscriptionFunding'], ParentType, ContextType, RequireFields<MutationRequestFundingAddressArgs, 'request'>>;
  siwe?: Resolver<ResolversTypes['Web3LoginUser'], ParentType, ContextType, RequireFields<MutationSiweArgs, 'address' | 'jwe'>>;
};

export type MutationRbacResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MutationRBAC'] = ResolversParentTypes['MutationRBAC']> = {
  createRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationRbacCreateRoleArgs, 'name'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NonceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Nonce'] = ResolversParentTypes['Nonce']> = {
  chainId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiration?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  issuedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messageToSign?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nonce?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pubKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Permission'] = ResolversParentTypes['Permission']> = {
  action?: Resolver<ResolversTypes['PermissionAction'], ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['PermissionResource'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  inscriptionFunding?: Resolver<Maybe<ResolversTypes['InscriptionFunding']>, ParentType, ContextType, RequireFields<QueryInscriptionFundingArgs, 'id'>>;
  inscriptionTransaction?: Resolver<Maybe<ResolversTypes['InscriptionTransaction']>, ParentType, ContextType, RequireFields<QueryInscriptionTransactionArgs, 'id'>>;
  userByAddress?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<QueryUserByAddressArgs, 'address'>>;
};

export type RoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  addPermissions?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<RoleAddPermissionsArgs, 'permissions'>>;
  bindToUser?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<RoleBindToUserArgs, 'userAddress'>>;
  delete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  removePermissions?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<RoleRemovePermissionsArgs, 'permissions'>>;
  unbindFromUser?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<RoleUnbindFromUserArgs, 'userAddress'>>;
  userCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type S3ObjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['S3Object'] = ResolversParentTypes['S3Object']> = {
  bucket?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Web3LoginUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Web3LoginUser'] = ResolversParentTypes['Web3LoginUser']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Web3UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Web3User'] = ResolversParentTypes['Web3User']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  allowedActions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  nonce?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['BlockchainNetwork'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AxolotlFunding?: AxolotlFundingResolvers<ContextType>;
  AxolotlFundingPage?: AxolotlFundingPageResolvers<ContextType>;
  BitcoinScriptItem?: BitcoinScriptItemResolvers<ContextType>;
  Collection?: CollectionResolvers<ContextType>;
  InscriptionData?: InscriptionDataResolvers<ContextType>;
  InscriptionFunding?: InscriptionFundingResolvers<ContextType>;
  InscriptionTransaction?: InscriptionTransactionResolvers<ContextType>;
  InscriptionTransactionContent?: InscriptionTransactionContentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationRBAC?: MutationRbacResolvers<ContextType>;
  Nonce?: NonceResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  S3Object?: S3ObjectResolvers<ContextType>;
  Web3LoginUser?: Web3LoginUserResolvers<ContextType>;
  Web3User?: Web3UserResolvers<ContextType>;
};

