import type * as Types from '../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FetchFundingQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type FetchFundingQuery = { __typename?: 'Query', inscriptionFunding?: { __typename?: 'InscriptionFunding', id: string, qrSrc: string, network: Types.BitcoinNetwork, fundingAmountBtc: string, fundingAmountSats: number, fundingAddress: string, status: Types.FundingStatus } | null };


export const FetchFundingDocument = gql`
    query FetchFunding($id: ID!) {
  inscriptionFunding(id: $id) {
    id
    qrSrc
    network
    fundingAmountBtc
    fundingAmountSats
    fundingAddress
    status
  }
}
    `;

/**
 * __useFetchFundingQuery__
 *
 * To run a query within a React component, call `useFetchFundingQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchFundingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchFundingQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFetchFundingQuery(baseOptions: Apollo.QueryHookOptions<FetchFundingQuery, FetchFundingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchFundingQuery, FetchFundingQueryVariables>(FetchFundingDocument, options);
      }
export function useFetchFundingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchFundingQuery, FetchFundingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchFundingQuery, FetchFundingQueryVariables>(FetchFundingDocument, options);
        }
export type FetchFundingQueryHookResult = ReturnType<typeof useFetchFundingQuery>;
export type FetchFundingLazyQueryHookResult = ReturnType<typeof useFetchFundingLazyQuery>;
export type FetchFundingQueryResult = Apollo.QueryResult<FetchFundingQuery, FetchFundingQueryVariables>;