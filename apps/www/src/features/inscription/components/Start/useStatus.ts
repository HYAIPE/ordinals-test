import { useMemo } from "react";
import { useCollectionStatusQueryQuery } from "./status.generated";

export function useStatus(collectionId: string) {
  const { data, loading, error } = useCollectionStatusQueryQuery({
    variables: {
      collectionId,
    },
  });
  const count = useMemo(() => {
    if (data) {
      return {
        revealedCount: data.revealedFundings.fundings?.reduce(
          (acc, f) => acc + (f?.fundingRevealTxIds?.length ?? 0),
          0
        ),
        totalCount: data.collection?.totalCount ?? 0,
        maxSupply: data.collection?.maxSupply ?? 0,
      };
    }
    return undefined;
  }, [data]);
  return {
    ...count,
    success: !!data,
    loading,
    error,
  };
}
