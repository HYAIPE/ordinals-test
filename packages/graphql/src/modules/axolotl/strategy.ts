import { ID_AddressInscription } from "@0xflick/ordinals-models";
import { Context } from "../../context/index.js";
import { fetchAllClaimables } from "./controllers.js";

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
    })),
  });

  return claimables.map((c, index) => ({
    claimable: c,
    inscriptionDoc: inscriptionDocs[index],
  }));
}
