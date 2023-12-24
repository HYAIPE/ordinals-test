import { readContract } from "@wagmi/core";
import { ClaimsDao, iAllowanceAbi } from "@0xflick/ordinals-backend";
import { wagmi } from "@0xflick/ordinals-config";

export type TClaimable = {
  destinationAddress: string;
  index: number;
  observedBlockHeight: number;
};

export async function fetchAllClaimables({
  address,
  collectionId,
  axolotlAllowanceChainId,
  axolotlAllowanceContractAddress,
  claimsDao,
}: {
  address: `0x${string}`;
  collectionId: string;
  axolotlAllowanceChainId: number;
  axolotlAllowanceContractAddress: `0x${string}`;
  claimsDao: ClaimsDao;
}) {
  const [onChainClaimables, existingClaimables] = await Promise.all([
    readContract(wagmi.config, {
      abi: iAllowanceAbi,
      chainId: axolotlAllowanceChainId as 1 | 11155111 | 8453,
      address: axolotlAllowanceContractAddress,
      functionName: "allClaimable",
      args: [address],
    }),
    claimsDao.getAllClaimsForCollectionAddress({
      claimedAddress: address,
      collectionId,
      contractAddress: axolotlAllowanceContractAddress,
      chainId: axolotlAllowanceChainId,
    }),
  ]);

  console.log({
    onChainClaimables,
    existingClaimables,
  });

  // Find the claimables that are not yet claimed by filtering out any existing claimables that already have a fundingId
  // but first we need to track the index of the claimables before we filter
  const destinationAddressesWithIndex = onChainClaimables.map(
    (destinationAddress, index) => ({
      destinationAddress,
      index,
    }),
  );

  return destinationAddressesWithIndex.reduce(
    (accumulator, { destinationAddress, index }) => {
      const fundingClaim = existingClaimables.find(
        (claimable) =>
          claimable.index === index &&
          claimable.destinationAddress === destinationAddress &&
          claimable.fundingId,
      );

      const existingClaimable = existingClaimables.find(
        (claimable) =>
          claimable.index === index &&
          claimable.destinationAddress === destinationAddress &&
          !claimable.fundingId,
      );

      if (fundingClaim) {
        accumulator.claimed.push({
          destinationAddress,
          index,
          observedBlockHeight: fundingClaim.observedBlockHeight,
        });
        return accumulator;
      } else if (existingClaimable) {
        accumulator.verified.push({
          destinationAddress,
          index,
          observedBlockHeight: existingClaimable.observedBlockHeight,
        });
      } else {
        accumulator.unverified.push({
          destinationAddress,
          index,
          observedBlockHeight: 0,
        });
      }

      return accumulator;
    },
    {
      verified: [] as TClaimable[],
      unverified: [] as TClaimable[],
      claimed: [] as TClaimable[],
    } as {
      verified: TClaimable[];
      unverified: TClaimable[];
      claimed: TClaimable[];
    },
  );
}
