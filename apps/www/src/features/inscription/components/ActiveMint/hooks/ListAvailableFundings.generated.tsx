import type * as Types from '../../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ListAvailableFundingsQueryVariables = Types.Exact<{
  openEditionRequest: Types.AxolotlAvailableOpenEditionRequest;
}>;


export type ListAvailableFundingsQuery = { __typename?: 'Query', axolotlAvailableOpenEditionFundingClaims: Array<{ __typename?: 'AxolotlAvailableOpenEditionFunding', id: string, tokenIds: Array<number>, destinationAddress: string, status: Types.FundingStatus, funding?: { __typename?: 'InscriptionFunding', network: Types.BitcoinNetwork, fundingAmountBtc: string, fundingAmountSats: number, fundingAddress: string, qrSrc: string } | null }> };


export const ListAvailableFundingsDocument = gql`
    query ListAvailableFundings($openEditionRequest: AxolotlAvailableOpenEditionRequest!) {
  axolotlAvailableOpenEditionFundingClaims(request: $openEditionRequest) {
    id
    tokenIds
    destinationAddress
    status
    funding {
      network
      fundingAmountBtc
      fundingAmountSats
      fundingAddress
      qrSrc
      network
    }
  }
}
    `;

/**
 * __useListAvailableFundingsQuery__
 *
 * To run a query within a React component, call `useListAvailableFundingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListAvailableFundingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListAvailableFundingsQuery({
 *   variables: {
 *      openEditionRequest: // value for 'openEditionRequest'
 *   },
 * });
 */
export function useListAvailableFundingsQuery(baseOptions: Apollo.QueryHookOptions<ListAvailableFundingsQuery, ListAvailableFundingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListAvailableFundingsQuery, ListAvailableFundingsQueryVariables>(ListAvailableFundingsDocument, options);
      }
export function useListAvailableFundingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListAvailableFundingsQuery, ListAvailableFundingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListAvailableFundingsQuery, ListAvailableFundingsQueryVariables>(ListAvailableFundingsDocument, options);
        }
export type ListAvailableFundingsQueryHookResult = ReturnType<typeof useListAvailableFundingsQuery>;
export type ListAvailableFundingsLazyQueryHookResult = ReturnType<typeof useListAvailableFundingsLazyQuery>;
export type ListAvailableFundingsQueryResult = Apollo.QueryResult<ListAvailableFundingsQuery, ListAvailableFundingsQueryVariables>;