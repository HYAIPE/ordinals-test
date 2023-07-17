import type * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SiwbMutationVariables = Types.Exact<{
  address: Types.Scalars['ID']['input'];
  jwe: Types.Scalars['String']['input'];
}>;


export type SiwbMutation = { __typename?: 'Mutation', siwb: { __typename?: 'Web3LoginUser', token: string } };


export const SiwbDocument = gql`
    mutation SIWB($address: ID!, $jwe: String!) {
  siwb(address: $address, jwe: $jwe) {
    token
  }
}
    `;
export type SiwbMutationFn = Apollo.MutationFunction<SiwbMutation, SiwbMutationVariables>;

/**
 * __useSiwbMutation__
 *
 * To run a mutation, you first call `useSiwbMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSiwbMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [siwbMutation, { data, loading, error }] = useSiwbMutation({
 *   variables: {
 *      address: // value for 'address'
 *      jwe: // value for 'jwe'
 *   },
 * });
 */
export function useSiwbMutation(baseOptions?: Apollo.MutationHookOptions<SiwbMutation, SiwbMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SiwbMutation, SiwbMutationVariables>(SiwbDocument, options);
      }
export type SiwbMutationHookResult = ReturnType<typeof useSiwbMutation>;
export type SiwbMutationResult = Apollo.MutationResult<SiwbMutation>;
export type SiwbMutationOptions = Apollo.BaseMutationOptions<SiwbMutation, SiwbMutationVariables>;