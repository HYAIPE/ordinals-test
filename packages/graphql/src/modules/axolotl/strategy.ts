import { ID_AddressInscription, ID_Collection } from "@0xflick/ordinals-models";
import { Context } from "../../context/index.js";
import { fetchAllClaimables } from "./controllers.js";

type InscriptionFactoryFn<T extends { id: ID_AddressInscription }> = (
  requests: {
    destinationAddress: string;
    index: number;
  }[],
) => Promise<T[]>;

export async function openEditionStrategy() {
  return (
    claimables: {
      destinationAddress: string;
      index: number;
    }[],
  ) => {
    return claimables.map((claimable) => ({
      id: claimable.destinationAddress,
      inscriptionType: "OPEN_EDITION",
      inscriptionStatus: "PENDING",
      inscriptionData: {
        index: claimable.index,
      },
    }));
  };
}

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
    collectionId,
    inscriptionFactory,
  }: {
    address: `0x${string}`;
    collectionId: ID_Collection;
    inscriptionFactory: InscriptionFactoryFn<T>;
  },
) {
  const { verified: claimables } = await fetchAllClaimables({
    address,
    axolotlAllowanceChainId,
    axolotlAllowanceContractAddress,
    claimsDao,
  });

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
      collectionId,
    })),
  });

  return claimables.map((c, index) => ({
    claimable: c,
    inscriptionDoc: inscriptionDocs[index],
  }));
}
