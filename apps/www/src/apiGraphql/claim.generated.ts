import type * as Types from '../graphql/types';

import type { GraphQLClient } from 'graphql-request';
import type { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
export type OpenEditionClaimMutationVariables = Types.Exact<{
  request: Types.AxolotlOpenEditionRequest;
}>;


export type OpenEditionClaimMutation = { __typename?: 'Mutation', axolotlFundingOpenEditionRequest: { __typename?: 'AxolotlOpenEditionResponse', problems?: Array<{ __typename?: 'AxolotlProblem', code: string, message: string }> | null, data?: { __typename?: 'AxolotlFunding', id: string, tokenIds: Array<number>, inscriptionFunding?: { __typename?: 'InscriptionFunding', id: string, fundingAddress: string, fundingAmountSats: number } | null } | null } };


export const OpenEditionClaimDocument = gql`
    mutation openEditionClaim($request: AxolotlOpenEditionRequest!) {
  axolotlFundingOpenEditionRequest(request: $request) {
    problems {
      code
      message
    }
    data {
      id
      inscriptionFunding {
        id
        fundingAddress
        fundingAmountSats
      }
      tokenIds
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    openEditionClaim(variables: OpenEditionClaimMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<OpenEditionClaimMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<OpenEditionClaimMutation>(OpenEditionClaimDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'openEditionClaim', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;