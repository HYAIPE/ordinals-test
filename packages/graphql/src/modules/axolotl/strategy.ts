import { ID_AddressInscription, ID_Collection } from "@0xflick/ordinals-models";
import { Context } from "../../context/index.js";
import { fetchAllClaimables } from "./controllers.js";
import { AxolotlError } from "./errors.js";
import { AxolotlModel } from "./models.js";

const USER_OPEN_EDITION_LIMIT = 100;

type InscriptionFactoryFn<T extends AxolotlModel> = (
  requests: {
    destinationAddress: string;
    index: number;
  }[],
  config: {
    scriptUrl: string;
    revealDelta: number;
    tipAddress?: string;
    tipAmount?: number;
  },
) => Promise<T>;

export async function openEditionStrategy<T extends AxolotlModel>(
  { fundingDao, openEditionClaimsDao }: Context,
  {
    claimCount,
    destinationAddress,
    collectionId,
    inscriptionFactory,
    revealDelta,
    scriptUrl,
    tipAddress,
    tipAmount,
  }: {
    claimCount: number;
    destinationAddress: `0x${string}`;
    collectionId: ID_Collection;
    tipAmount?: number;
    tipAddress?: string;
    revealDelta: number;
    scriptUrl: string;
    inscriptionFactory: InscriptionFactoryFn<T>;
  },
) {
  const existingFundings = await fundingDao.getAllFundingByAddressCollection({
    address: destinationAddress,
    collectionId,
  });
  const claimables: {
    destinationAddress: string;
    index: number;
  }[] = [];

  if (existingFundings.length + claimCount > USER_OPEN_EDITION_LIMIT) {
    throw new AxolotlError(
      `User has reached the open edition limit of ${USER_OPEN_EDITION_LIMIT}`,
      "USER_OPEN_EDITION_LIMIT_REACHED",
    );
  }
  for (let i = 0; i < claimCount; i++) {
    claimables.push({
      destinationAddress,
      index: existingFundings.length + i,
    });
  }
  const inscriptionDoc = await inscriptionFactory(claimables, {
    revealDelta,
    scriptUrl,
    tipAddress,
    tipAmount,
  });

  await openEditionClaimsDao.putBatch(
    inscriptionDoc.tokenIds.map((_, index) => {
      return {
        collectionId,
        destinationAddress,
        fundingId: inscriptionDoc.id,
        index: existingFundings.length + index,
      };
    }),
  );

  // return inscriptionDoc.tokenIds.map((_, index) => ({
  //   claimable: {
  //     destinationAddress,
  //     index: existingFundings.length + index,
  //   },
  //   inscriptionDoc,
  // }));

  return inscriptionDoc;
}

// export async function contractAllowanceStrategy<
//   T extends { id: ID_AddressInscription },
// >(
//   {
//     axolotlAllowanceChainId,
//     axolotlAllowanceContractAddress,
//     claimsDao,
//   }: Context,
//   {
//     address,
//     collectionId,
//     inscriptionFactory,
//   }: {
//     address: `0x${string}`;
//     collectionId: ID_Collection;
//     inscriptionFactory: InscriptionFactoryFn<T>;
//   },
// ) {
//   const { verified: claimables } = await fetchAllClaimables({
//     address,
//     axolotlAllowanceChainId,
//     axolotlAllowanceContractAddress,
//     claimsDao,
//     collectionId,
//   });

//   // Now we can create the inscription documents
//   const inscriptionDocs = await inscriptionFactory(claimables);

//   if (claimables.length === 0) {
//     return [];
//   }

//   // Update the claimables with the fundingIds
//   await claimsDao.batchUpdateFundingIds({
//     observedClaimsWithFundingIds: claimables.map((claimable, docIndex) => ({
//       ...claimable,
//       fundingId: inscriptionDocs[docIndex].id,
//       chainId: axolotlAllowanceChainId,
//       claimedAddress: address,
//       contractAddress: axolotlAllowanceContractAddress,
//       observedBlockHeight: claimable.observedBlockHeight,
//       collectionId,
//     })),
//   });

//   return claimables.map((c, index) => ({
//     claimable: c,
//     inscriptionDoc: inscriptionDocs[index],
//   }));
// }
