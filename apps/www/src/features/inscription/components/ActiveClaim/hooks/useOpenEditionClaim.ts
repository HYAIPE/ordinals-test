import {
  OpenEditionClaimMutation,
  useOpenEditionClaimMutation,
} from "./OpenEditionClaim.generated";

function transform(data?: OpenEditionClaimMutation | null) {
  return data?.axolotlFundingOpenEditionRequest;
}

export const useOpenEditionClaim = () => {
  const [fetch, { data, loading, error }] = useOpenEditionClaimMutation();

  return [
    fetch,
    {
      data: transform(data),
      loading,
      error,
    },
  ] as const;
};
