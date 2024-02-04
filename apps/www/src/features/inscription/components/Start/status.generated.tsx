import type * as Types from '../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CollectionStatusQueryQueryVariables = Types.Exact<{
  collectionId: Types.Scalars['ID']['input'];
}>;


export type CollectionStatusQueryQuery = { __typename?: 'Query', revealedFundings: { __typename?: 'InscriptionFundingsResult', fundings?: Array<{ __typename?: 'InscriptionFunding', id: string, fundingRevealTxIds?: Array<string> | null }> | null }, collection: { __typename?: 'Collection', id: string, name: string, totalCount: number, maxSupply: number } };


export const CollectionStatusQueryDocument = gql`
    query CollectionStatusQuery($collectionId: ID!) {
  revealedFundings: inscriptionFundings(
    query: {collectionId: $collectionId, fundingStatus: REVEALED}
  ) {
    fundings {
      id
      fundingRevealTxIds
    }
  }
  collection(id: $collectionId) {
    id
    name
    totalCount
    maxSupply
  }
}
    `;

/**
 * __useCollectionStatusQueryQuery__
 *
 * To run a query within a React component, call `useCollectionStatusQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollectionStatusQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollectionStatusQueryQuery({
 *   variables: {
 *      collectionId: // value for 'collectionId'
 *   },
 * });
 */
export function useCollectionStatusQueryQuery(baseOptions: Apollo.QueryHookOptions<CollectionStatusQueryQuery, CollectionStatusQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CollectionStatusQueryQuery, CollectionStatusQueryQueryVariables>(CollectionStatusQueryDocument, options);
      }
export function useCollectionStatusQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CollectionStatusQueryQuery, CollectionStatusQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CollectionStatusQueryQuery, CollectionStatusQueryQueryVariables>(CollectionStatusQueryDocument, options);
        }
export type CollectionStatusQueryQueryHookResult = ReturnType<typeof useCollectionStatusQueryQuery>;
export type CollectionStatusQueryLazyQueryHookResult = ReturnType<typeof useCollectionStatusQueryLazyQuery>;
export type CollectionStatusQueryQueryResult = Apollo.QueryResult<CollectionStatusQueryQuery, CollectionStatusQueryQueryVariables>;