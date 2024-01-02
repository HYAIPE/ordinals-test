import type * as Types from '../../../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OpenEditionClaimMutationVariables = Types.Exact<{
  request: Types.AxolotlOpenEditionRequest;
}>;


export type OpenEditionClaimMutation = { __typename?: 'Mutation', axolotlFundingOpenEditionRequest: { __typename?: 'AxolotlOpenEditionResponse', problems?: Array<{ __typename?: 'AxolotlProblem', code: string, message: string }> | null, data?: { __typename?: 'AxolotlFunding', id: string, tokenIds: Array<number> } | null } };


export const OpenEditionClaimDocument = gql`
    mutation OpenEditionClaim($request: AxolotlOpenEditionRequest!) {
  axolotlFundingOpenEditionRequest(request: $request) {
    problems {
      code
      message
    }
    data {
      id
      tokenIds
    }
  }
}
    `;
export type OpenEditionClaimMutationFn = Apollo.MutationFunction<OpenEditionClaimMutation, OpenEditionClaimMutationVariables>;

/**
 * __useOpenEditionClaimMutation__
 *
 * To run a mutation, you first call `useOpenEditionClaimMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOpenEditionClaimMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [openEditionClaimMutation, { data, loading, error }] = useOpenEditionClaimMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useOpenEditionClaimMutation(baseOptions?: Apollo.MutationHookOptions<OpenEditionClaimMutation, OpenEditionClaimMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OpenEditionClaimMutation, OpenEditionClaimMutationVariables>(OpenEditionClaimDocument, options);
      }
export type OpenEditionClaimMutationHookResult = ReturnType<typeof useOpenEditionClaimMutation>;
export type OpenEditionClaimMutationResult = Apollo.MutationResult<OpenEditionClaimMutation>;
export type OpenEditionClaimMutationOptions = Apollo.BaseMutationOptions<OpenEditionClaimMutation, OpenEditionClaimMutationVariables>;