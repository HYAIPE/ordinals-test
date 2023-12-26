import {
  ListAvailableFundingsQuery,
  useListAvailableFundingsQuery,
} from "./ListAvailableFundings.generated";

function transform(data?: ListAvailableFundingsQuery) {
  return data?.axolotlAvailableOpenEditionFundingClaims;
}

export const useFundings = ({
  collectionId,
  destinationAddress,
  polling,
}: {
  collectionId: string;
  destinationAddress: string;
  polling?: boolean;
}) => {
  const { data, loading, error } = useListAvailableFundingsQuery({
    variables: {
      openEditionRequest: {
        collectionId,
        destinationAddress,
      },
    },
    pollInterval: polling ? 5000 : undefined,
  });

  return {
    data: transform(data),
    loading,
    error,
  };
};
