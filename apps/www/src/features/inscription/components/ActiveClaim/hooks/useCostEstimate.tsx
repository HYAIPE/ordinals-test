import { FeeLevel } from "@/graphql/types";
import { toGraphqlBitcoinNetwork } from "@/graphql/transforms";
import {
  OpenEditionEstimateQuery,
  useOpenEditionEstimateQuery,
} from "./OpenEditionEstimate.generated";
import { BitcoinNetworkType } from "sats-connect";

function transform(data?: OpenEditionEstimateQuery | null) {
  return data?.axolotlEstimateFee;
}

export const useCostEstimate = ({
  count,
  network,
  feePerByte,
  feeLevel,
  pollInterval,
  skip,
}: {
  count: number;
  network: BitcoinNetworkType;
  feePerByte?: number;
  feeLevel?: FeeLevel;
  pollInterval?: number;
  skip?: boolean;
}) => {
  const { data, loading, error } = useOpenEditionEstimateQuery({
    variables: {
      count,
      network: toGraphqlBitcoinNetwork(network),
      feePerByte,
      feeLevel,
    },
    pollInterval,
    fetchPolicy: "no-cache",
    skip,
  });

  return { data: transform(data), loading, error };
};
