import type * as Types from '../../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OpenEditionEstimateQueryVariables = Types.Exact<{
  network: Types.BitcoinNetwork;
  feeLevel?: Types.InputMaybe<Types.FeeLevel>;
  feePerByte?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  count: Types.Scalars['Int']['input'];
}>;


export type OpenEditionEstimateQuery = { __typename?: 'Query', axolotlEstimateFee: { __typename?: 'AxolotlFeeEstimate', tipPerTokenSats: number, tipPerTokenBtc: string, totalInscriptionSats: number, totalInscriptionBtc: string, totalFeeSats: number, totalFeeBtc: string, feePerByte: number } };


export const OpenEditionEstimateDocument = gql`
    query OpenEditionEstimate($network: BitcoinNetwork!, $feeLevel: FeeLevel, $feePerByte: Int, $count: Int!) {
  axolotlEstimateFee(
    network: $network
    feeLevel: $feeLevel
    feePerByte: $feePerByte
    count: $count
  ) {
    tipPerTokenSats
    tipPerTokenBtc
    totalInscriptionSats
    totalInscriptionBtc
    totalFeeSats
    totalFeeBtc
    feePerByte
  }
}
    `;

/**
 * __useOpenEditionEstimateQuery__
 *
 * To run a query within a React component, call `useOpenEditionEstimateQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpenEditionEstimateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpenEditionEstimateQuery({
 *   variables: {
 *      network: // value for 'network'
 *      feeLevel: // value for 'feeLevel'
 *      feePerByte: // value for 'feePerByte'
 *      count: // value for 'count'
 *   },
 * });
 */
export function useOpenEditionEstimateQuery(baseOptions: Apollo.QueryHookOptions<OpenEditionEstimateQuery, OpenEditionEstimateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OpenEditionEstimateQuery, OpenEditionEstimateQueryVariables>(OpenEditionEstimateDocument, options);
      }
export function useOpenEditionEstimateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OpenEditionEstimateQuery, OpenEditionEstimateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OpenEditionEstimateQuery, OpenEditionEstimateQueryVariables>(OpenEditionEstimateDocument, options);
        }
export type OpenEditionEstimateQueryHookResult = ReturnType<typeof useOpenEditionEstimateQuery>;
export type OpenEditionEstimateLazyQueryHookResult = ReturnType<typeof useOpenEditionEstimateLazyQuery>;
export type OpenEditionEstimateQueryResult = Apollo.QueryResult<OpenEditionEstimateQuery, OpenEditionEstimateQueryVariables>;