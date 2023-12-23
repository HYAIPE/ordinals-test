import { useMemo } from "react";
import {
  useCollectionsQuery,
  CollectionsQuery,
} from "../graphql/collections.generated";

export type TCollection = CollectionsQuery["collections"][0];

export function useCollections() {
  const { data, loading, error } = useCollectionsQuery();

  const mData = useMemo(() => {
    return data?.collections;
  }, [data]);

  return {
    data: mData,
    loading,
    error,
  };
}
