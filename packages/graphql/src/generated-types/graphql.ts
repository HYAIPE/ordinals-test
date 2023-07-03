/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { InscriptionTransactionModel } from '../modules/inscriptionTransaction/models.js';
import { InscriptionFundingModel } from '../modules/inscriptionFunding/models.js';
import { InscriptionTransactionContentModel } from '../modules/inscriptionRequest/models.js';
import { Context } from '../context/index.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
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

export type InscriptionFunding = {
  __typename?: 'InscriptionFunding';
  fundingAddress: Scalars['String']['output'];
  fundingAmountBtc: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inscriptionContent: InscriptionData;
  inscriptionTransaction: InscriptionTransaction;
  network: BitcoinNetwork;
  overhead: Scalars['Int']['output'];
  padding: Scalars['Int']['output'];
  qrSrc: Scalars['String']['output'];
  qrValue: Scalars['String']['output'];
  s3Object: S3Object;
  totalFee: Scalars['Int']['output'];
};


export type InscriptionFundingInscriptionContentArgs = {
  tapKey: Scalars['String']['input'];
};

export type InscriptionRequest = {
  destinationAddress: Scalars['String']['input'];
  feeLevel?: InputMaybe<FeeLevel>;
  feePerByte?: InputMaybe<Scalars['Int']['input']>;
  files: Array<InscriptionData>;
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
  axolotlFundingAddressRequest: InscriptionFunding;
  requestFundingAddress: InscriptionFunding;
};


export type MutationAxolotlFundingAddressRequestArgs = {
  address: Scalars['String']['input'];
};


export type MutationRequestFundingAddressArgs = {
  request: InscriptionRequest;
};

export type Query = {
  __typename?: 'Query';
  inscriptionFunding?: Maybe<InscriptionFunding>;
  inscriptionTransaction?: Maybe<InscriptionTransaction>;
};


export type QueryInscriptionFundingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInscriptionTransactionArgs = {
  id: Scalars['ID']['input'];
};

export type S3Object = {
  __typename?: 'S3Object';
  bucket: Scalars['String']['output'];
  key: Scalars['String']['output'];
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
  BitcoinNetwork: BitcoinNetwork;
  BitcoinScriptItem: ResolverTypeWrapper<BitcoinScriptItem>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Collection: ResolverTypeWrapper<Collection>;
  CollectionInput: CollectionInput;
  FeeLevel: FeeLevel;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  InscriptionData: ResolverTypeWrapper<InscriptionData>;
  InscriptionFunding: ResolverTypeWrapper<InscriptionFundingModel>;
  InscriptionRequest: InscriptionRequest;
  InscriptionTransaction: ResolverTypeWrapper<InscriptionTransactionModel>;
  InscriptionTransactionContent: ResolverTypeWrapper<InscriptionTransactionContentModel>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  S3Object: ResolverTypeWrapper<S3Object>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BitcoinScriptItem: BitcoinScriptItem;
  Boolean: Scalars['Boolean']['output'];
  Collection: Collection;
  CollectionInput: CollectionInput;
  ID: Scalars['ID']['output'];
  InscriptionData: InscriptionData;
  InscriptionFunding: InscriptionFundingModel;
  InscriptionRequest: InscriptionRequest;
  InscriptionTransaction: InscriptionTransactionModel;
  InscriptionTransactionContent: InscriptionTransactionContentModel;
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  S3Object: S3Object;
  String: Scalars['String']['output'];
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inscriptionContent?: Resolver<ResolversTypes['InscriptionData'], ParentType, ContextType, RequireFields<InscriptionFundingInscriptionContentArgs, 'tapKey'>>;
  inscriptionTransaction?: Resolver<ResolversTypes['InscriptionTransaction'], ParentType, ContextType>;
  network?: Resolver<ResolversTypes['BitcoinNetwork'], ParentType, ContextType>;
  overhead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  padding?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  qrSrc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  qrValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s3Object?: Resolver<ResolversTypes['S3Object'], ParentType, ContextType>;
  totalFee?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  axolotlFundingAddressRequest?: Resolver<ResolversTypes['InscriptionFunding'], ParentType, ContextType, RequireFields<MutationAxolotlFundingAddressRequestArgs, 'address'>>;
  requestFundingAddress?: Resolver<ResolversTypes['InscriptionFunding'], ParentType, ContextType, RequireFields<MutationRequestFundingAddressArgs, 'request'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  inscriptionFunding?: Resolver<Maybe<ResolversTypes['InscriptionFunding']>, ParentType, ContextType, RequireFields<QueryInscriptionFundingArgs, 'id'>>;
  inscriptionTransaction?: Resolver<Maybe<ResolversTypes['InscriptionTransaction']>, ParentType, ContextType, RequireFields<QueryInscriptionTransactionArgs, 'id'>>;
};

export type S3ObjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['S3Object'] = ResolversParentTypes['S3Object']> = {
  bucket?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  BitcoinScriptItem?: BitcoinScriptItemResolvers<ContextType>;
  Collection?: CollectionResolvers<ContextType>;
  InscriptionData?: InscriptionDataResolvers<ContextType>;
  InscriptionFunding?: InscriptionFundingResolvers<ContextType>;
  InscriptionTransaction?: InscriptionTransactionResolvers<ContextType>;
  InscriptionTransactionContent?: InscriptionTransactionContentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  S3Object?: S3ObjectResolvers<ContextType>;
};

