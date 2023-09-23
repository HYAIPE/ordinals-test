import { ClaimsDao, readIAllowance } from "@0xflick/ordinals-backend";

export type TClaimable = {
  destinationAddress: string;
  index: number;
  observedBlockHeight: number;
};

export async function fetchAllClaimables({
  address,
  axolotlAllowanceChainId,
  axolotlAllowanceContractAddress,
  claimsDao,
}: {
  address: `0x${string}`;
  axolotlAllowanceChainId: number;
  axolotlAllowanceContractAddress: `0x${string}`;
  claimsDao: ClaimsDao;
}) {
  const [onChainClaimables, existingClaimables] = await Promise.all([
    readIAllowance({
      chainId: axolotlAllowanceChainId,
      address: axolotlAllowanceContractAddress,
      functionName: "allClaimable",
      args: [address],
    }),
    claimsDao.getAllClaims({
      address,
      contractAddress: axolotlAllowanceContractAddress,
      chainId: axolotlAllowanceChainId,
    }),
  ]);

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
      const existingClaimable = existingClaimables.find(
        (claimable) =>
          claimable.index === index &&
          claimable.destinationAddress === destinationAddress &&
          !claimable.fundingId,
      );

      if (existingClaimable) {
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
    } as {
      verified: TClaimable[];
      unverified: TClaimable[];
    },
  );
}
