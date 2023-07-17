import type * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BitcoinNonceMutationVariables = Types.Exact<{
  address: Types.Scalars['ID']['input'];
}>;


export type BitcoinNonceMutation = { __typename?: 'Mutation', nonceBitcoin: { __typename?: 'Nonce', nonce: string, messageToSign: string, pubKey: string } };


export const BitcoinNonceDocument = gql`
    mutation BitcoinNonce($address: ID!) {
  nonceBitcoin(address: $address) {
    nonce
    messageToSign
    pubKey
  }
}
    `;
export type BitcoinNonceMutationFn = Apollo.MutationFunction<BitcoinNonceMutation, BitcoinNonceMutationVariables>;

/**
 * __useBitcoinNonceMutation__
 *
 * To run a mutation, you first call `useBitcoinNonceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBitcoinNonceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bitcoinNonceMutation, { data, loading, error }] = useBitcoinNonceMutation({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useBitcoinNonceMutation(baseOptions?: Apollo.MutationHookOptions<BitcoinNonceMutation, BitcoinNonceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BitcoinNonceMutation, BitcoinNonceMutationVariables>(BitcoinNonceDocument, options);
      }
export type BitcoinNonceMutationHookResult = ReturnType<typeof useBitcoinNonceMutation>;
export type BitcoinNonceMutationResult = Apollo.MutationResult<BitcoinNonceMutation>;
export type BitcoinNonceMutationOptions = Apollo.BaseMutationOptions<BitcoinNonceMutation, BitcoinNonceMutationVariables>;