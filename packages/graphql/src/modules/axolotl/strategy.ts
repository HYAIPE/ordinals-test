import {
  ID_AddressInscription,
  IInscriptionDocFundingWait,
} from "@0xflick/ordinals-models";
import { Context } from "../../context/index.js";
import { readIAllowance } from "@0xflick/ordinals-backend";

type InscriptionFactoryFn<T extends { id: ID_AddressInscription }> = (
  requests: {
    destinationAddress: string;
    index: number;
  }[],
) => Promise<T[]>;

export async function contractAllowanceStrategy<
  T extends { id: ID_AddressInscription },
>(
  {
    axolotlAllowanceChainId,
    axolotlAllowanceContractAddress,
    claimsDao,
  }: Context,
  {
    address,
    inscriptionFactory,
  }: {
    address: `0x${string}`;
    inscriptionFactory: InscriptionFactoryFn<T>;
  },
) {
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

  const claimables = destinationAddressesWithIndex.reduce(
    (accumulator, { destinationAddress, index }) => {
      const existingClaimable = existingClaimables.find(
        (claimable) =>
          claimable.index === index &&
          claimable.destinationAddress === destinationAddress &&
          !claimable.fundingId,
      );

      if (existingClaimable) {
        accumulator.push({
          destinationAddress,
          index,
          observedBlockHeight: existingClaimable.observedBlockHeight,
        });
      }

      return accumulator;
    },
    [] as {
      destinationAddress: string;
      index: number;
      observedBlockHeight: number;
    }[],
  );

  // Now we can create the inscription documents
  const inscriptionDocs = await inscriptionFactory(claimables);

  if (claimables.length === 0) {
    return [];
  }
  // Update the claimables with the fundingIds
  await claimsDao.batchUpdateFundingIds({
    observedClaimsWithFundingIds: claimables.map((claimable, docIndex) => ({
      ...claimable,
      fundingId: inscriptionDocs[docIndex].id,
      chainId: axolotlAllowanceChainId,
      claimedAddress: address,
      contractAddress: axolotlAllowanceContractAddress,
      observedBlockHeight: claimable.observedBlockHeight,
    })),
  });

  return claimables.map((c, index) => ({
    claimable: c,
    inscriptionDoc: inscriptionDocs[index],
  }));
}
