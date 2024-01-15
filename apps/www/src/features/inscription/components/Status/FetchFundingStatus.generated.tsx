import type * as Types from '../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FetchFundingStatusQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type FetchFundingStatusQuery = { __typename?: 'Query', inscriptionFunding?: { __typename?: 'InscriptionFunding', id: string, network: Types.BitcoinNetwork, status: Types.FundingStatus, fundingTxId?: string | null, fundingTxUrl?: string | null, fundingGenesisTxId?: string | null, fundingGenesisTxUrl?: string | null, fundingRevealTxIds?: Array<string> | null, fundingRevealTxUrls?: Array<string> | null, inscriptionTransaction: { __typename?: 'InscriptionTransaction', count: number } } | null };


export const FetchFundingStatusDocument = gql`
    query FetchFundingStatus($id: ID!) {
  inscriptionFunding(id: $id) {
    id
    network
    status
    fundingTxId
    fundingTxUrl
    fundingGenesisTxId
    fundingGenesisTxUrl
    fundingRevealTxIds
    fundingRevealTxUrls
    inscriptionTransaction {
      count
    }
  }
}
    `;

/**
 * __useFetchFundingStatusQuery__
 *
 * To run a query within a React component, call `useFetchFundingStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchFundingStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchFundingStatusQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFetchFundingStatusQuery(baseOptions: Apollo.QueryHookOptions<FetchFundingStatusQuery, FetchFundingStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchFundingStatusQuery, FetchFundingStatusQueryVariables>(FetchFundingStatusDocument, options);
      }
export function useFetchFundingStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchFundingStatusQuery, FetchFundingStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchFundingStatusQuery, FetchFundingStatusQueryVariables>(FetchFundingStatusDocument, options);
        }
export type FetchFundingStatusQueryHookResult = ReturnType<typeof useFetchFundingStatusQuery>;
export type FetchFundingStatusLazyQueryHookResult = ReturnType<typeof useFetchFundingStatusLazyQuery>;
export type FetchFundingStatusQueryResult = Apollo.QueryResult<FetchFundingStatusQuery, FetchFundingStatusQueryVariables>;