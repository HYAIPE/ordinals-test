import { S3Client } from "@aws-sdk/client-s3";
import { AxolotlModule } from "./generated-types/module-types.js";
import {
  IFundingDao,
  IFundingDocDao,
  MempoolClient,
  createInscriptionTransaction,
} from "@0xflick/ordinals-backend";
import {
  toBitcoinNetworkName,
  toGraphqlBitcoinNetworkName,
} from "../bitcoin/transforms.js";
import { toGraphqlFundingStatus } from "./transforms.js";
import { estimateFeesWithMempool } from "../bitcoin/fees.js";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import {
  AddressInscriptionModel,
  BitcoinNetworkNames,
  ID_Collection,
  TInscriptionDoc,
  InscriptionContent,
} from "@0xflick/ordinals-models";
import { AxolotlModel } from "../axolotl/models.js";
import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { MempoolModel } from "../bitcoin/models.js";
import { openEditionStrategy } from "./strategy.js";
import { bitcoinToSats } from "@0xflick/inscriptions";
import { AxolotlError } from "./errors.js";

function getConfig(config?: {
  scriptUrl?: string;
  revealDelta?: number;
  tipAddress?: string;
  tipAmount?: number;
}): {
  revealDelta: number;
  scriptUrl: string;
  tipAddress?: string;
  tipAmount?: number;
} {
  let revealDelta: number;
  let scriptUrl: string;
  let tipAddress: string | undefined;
  let tipAmount: number | undefined;
  if (typeof config?.scriptUrl === "undefined") {
    throw new AxolotlError(
      "Regtest network bad config, missing script_url",
      "BAD_CONFIG",
    );
  }
  scriptUrl = config.scriptUrl;
  revealDelta = config.revealDelta ?? 0;
  if (
    (typeof config.tipAddress !== "undefined" &&
      typeof config.tipAmount === "undefined") ||
    (typeof config.tipAddress === "undefined" &&
      typeof config.tipAmount !== "undefined")
  ) {
    throw new AxolotlError(
      "Must include a tip address and amount in config but only one was provided",
      "BAD_CONFIG",
    );
  }
  tipAddress = config.tipAddress!;
  tipAmount = config.tipAmount!;
  return {
    revealDelta,
    scriptUrl,
    tipAddress,
    tipAmount,
  };
}

async function createTranscriptionFunding({
  address,
  inscriptions,
  feeLevel,
  feePerByte,
  network,
  fundingDao,
  fundingDocDao,
  s3Client,
  inscriptionBucket,
  createMempoolBitcoinClient,
  tip,
}: {
  address: string;
  inscriptions: InscriptionContent[];
  feeLevel?: InputMaybe<FeeLevel>;
  feePerByte?: InputMaybe<number>;
  network: BitcoinNetworkNames;
  fundingDao: IFundingDao;
  fundingDocDao: IFundingDocDao;
  inscriptionBucket: string;
  s3Client: S3Client;
  tip: number;
  createMempoolBitcoinClient: (opts: {
    network: BitcoinNetworkNames;
  }) => MempoolClient["bitcoin"];
}) {
  const finalFee = await estimateFeesWithMempool({
    mempoolBitcoinClient: new MempoolModel(
      createMempoolBitcoinClient({
        network,
      }),
    ),
    feePerByte,
    feeLevel,
  });

  const {
    fundingAddress,
    fundingAmountBtc,
    initCBlock,
    initLeaf,
    initScript,
    initTapKey,
    overhead,
    padding,
    secKey,
    totalFee,
    writableInscriptions,
    files,
  } = await createInscriptionTransaction({
    address,
    feeRate: finalFee,
    network,
    tip,
    inscriptions,
  });

  const addressModel = new AddressInscriptionModel({
    address: fundingAddress,
    destinationAddress: address,
    network,
    contentIds: writableInscriptions.map((inscription) => inscription.tapkey),
    fundingStatus: "funding",
    timesChecked: 0,
    fundingAmountBtc,
    fundingAmountSat: Number(bitcoinToSats(fundingAmountBtc)),
    revealTxids: [],
    meta: {},
  });
  const doc: TInscriptionDoc = {
    id: addressModel.id,
    fundingAddress,
    fundingAmountBtc,
    initCBlock,
    initLeaf,
    initScript,
    initTapKey,
    network,
    overhead,
    padding,
    secKey,
    totalFee,
    writableInscriptions,
    tip,
  };
  const inscriptionFundingModel = new InscriptionFundingModel({
    id: addressModel.id,
    bucket: inscriptionBucket,
    document: doc,
    fundingAddress,
    s3Client,
  });
  await Promise.all([
    fundingDocDao.updateOrSaveInscriptionTransaction(doc),
    fundingDao.createFunding(addressModel),
    ...files.map((f) => fundingDocDao.saveInscriptionContent(f)),
  ]);
  return inscriptionFundingModel;
}
export const resolvers: AxolotlModule.Resolvers = {
  Mutation: {
    // axolotlFundingClaimRequest: async (
    //   _,
    //   {
    //     request: {
    //       claimingAddress,
    //       network,
    //       feeLevel,
    //       feePerByte,
    //       collectionId,
    //     },
    //   },
    //   context,
    // ) => {
    //   const inscriptions = await contractAllowanceStrategy(context, {
    //     address: claimingAddress as `0x${string}`,
    //     collectionId: collectionId as ID_Collection,
    //     inscriptionFactory: async (requests) => {
    //       return await Promise.all(
    //         requests.map(async ({ destinationAddress, index }) => {
    //           const {
    //             inscriptionBucket,
    //             axolotlInscriptionTip,
    //             fundingDocDao,
    //             createMempoolBitcoinClient,
    //           } = context;
    //           const axolotlModel = await AxolotlModel.create({
    //             collectionId: collectionId as ID_Collection,
    //             incrementingRevealDao:
    //               AxolotlModel.createDefaultIncrementingRevealDao(),
    //             network: toBitcoinNetworkName(network),
    //             mempool: new MempoolModel(
    //               createMempoolBitcoinClient({
    //                 network: toBitcoinNetworkName(network),
    //               }),
    //             ),
    //             destinationAddress,
    //             feeLevel,
    //             feePerByte,
    //             fundingDocDao,
    //             inscriptionBucket,
    //             tip: axolotlInscriptionTip,
    //             s3Client: context.s3Client,
    //             claimAddress: claimingAddress,
    //             claimIndex: index,
    //           });

    //           return axolotlModel;
    //         }),
    //       );
    //     },
    //   });
    //   if (inscriptions.length === 0) {
    //     throw new AxolotlError("No available claims", "NO_CLAIM_FOUND");
    //   }
    //   return inscriptions.map(({ claimable, inscriptionDoc }) => ({
    //     chameleon: inscriptionDoc.chameleon,
    //     createdAt: new Date().toISOString(),
    //     id: inscriptionDoc.id,
    //     destinationAddress: claimable.destinationAddress,
    //     tokenId: inscriptionDoc.tokenId,
    //     inscriptionFunding: inscriptionDoc.inscriptionFunding,
    //   }));
    // },
    axolotlFundingOpenEditionRequest: async (
      _,
      {
        request: {
          collectionId,
          claimCount,
          destinationAddress,
          network,
          feeLevel,
          feePerByte,
        },
      },
      context,
    ) => {
      const fundingDao = context.typedFundingDao<
        {},
        {
          regtest_tip_address?: string;
          regtest_tip_amount?: string;
          regtest_script_url?: string;
          regtest_reveal_delta?: string;
          testnet_tip_address?: string;
          testnet_tip_amount?: string;
          testnet_script_url?: string;
          testnet_reveal_delta?: string;
          mainnet_tip_address?: string;
          mainnet_tip_amount?: string;
          mainnet_script_url?: string;
          mainnet_reveal_delta?: string;
        }
      >();

      const collection = await fundingDao.getCollection(
        collectionId as ID_Collection,
      );
      if (!collection) {
        throw new AxolotlError(
          `Collection with id ${collectionId} not found`,
          "NO_COLLECTION_FOUND",
        );
      }

      const { revealDelta, scriptUrl, tipAddress, tipAmount } = (() => {
        switch (network) {
          case "REGTEST":
            return getConfig({
              revealDelta: collection.meta?.regtest_reveal_delta
                ? parseInt(collection.meta?.regtest_reveal_delta)
                : undefined,
              scriptUrl: collection.meta?.regtest_script_url,
              tipAddress: collection.meta?.regtest_tip_address,
              tipAmount: collection.meta?.regtest_tip_amount
                ? parseInt(collection.meta?.regtest_tip_amount)
                : undefined,
            });
          case "MAINNET":
            return getConfig({
              revealDelta: collection.meta?.mainnet_reveal_delta
                ? parseInt(collection.meta?.mainnet_reveal_delta)
                : undefined,
              scriptUrl: collection.meta?.mainnet_script_url,
              tipAddress: collection.meta?.mainnet_tip_address,
              tipAmount: collection.meta?.mainnet_tip_amount
                ? parseInt(collection.meta?.mainnet_tip_amount)
                : undefined,
            });
          case "TESTNET":
            return getConfig({
              revealDelta: collection.meta?.testnet_reveal_delta
                ? parseInt(collection.meta?.testnet_reveal_delta)
                : undefined,
              scriptUrl: collection.meta?.testnet_script_url,
              tipAddress: collection.meta?.testnet_tip_address,
              tipAmount: collection.meta?.testnet_tip_amount
                ? parseInt(collection.meta?.testnet_tip_amount)
                : undefined,
            });
        }
      })();

      const inscriptions = await openEditionStrategy(context, {
        claimCount: claimCount ?? 1,
        revealDelta,
        scriptUrl,
        tipAddress,
        tipAmount,
        destinationAddress: destinationAddress as `0x${string}`,
        collectionId: collectionId as ID_Collection,
        async inscriptionFactory(
          requests,
          { revealDelta, scriptUrl, tipAddress, tipAmount },
        ) {
          const {
            inscriptionBucket,
            fundingDocDao,
            createMempoolBitcoinClient,
          } = context;
          const axolotlModel = await AxolotlModel.create({
            collectionId: collectionId as ID_Collection,
            incrementingRevealDao:
              AxolotlModel.createDefaultIncrementingRevealDao(),
            network: toBitcoinNetworkName(network),
            mempool: new MempoolModel(
              createMempoolBitcoinClient({
                network: toBitcoinNetworkName(network),
              }),
            ),
            destinationAddress,
            feeLevel,
            feePerByte,
            fundingDocDao,
            inscriptionBucket,
            tip: tipAmount,
            tipDestination: tipAddress,
            s3Client: context.s3Client,
            count: requests.length,
            revealDelta,
            scriptUrl,
          });

          return axolotlModel;
        },
      });
      if (inscriptions.tokenIds.length === 0) {
        throw new AxolotlError("No available claims", "NO_CLAIM_FOUND");
      }
      return {
        problems: inscriptions.problems,
        data: {
          id: inscriptions.id,
          destinationAddress: destinationAddress as `0x${string}`,
          tokenIds: inscriptions.tokenIds,
          inscriptionFunding: inscriptions.inscriptionFunding,
        },
      };
    },
    // requestFundingAddress: async (
    //   _,
    //   {
    //     request: {
    //       destinationAddress,
    //       files: inputFiles,
    //       feeLevel,
    //       feePerByte,
    //       network: inputNetwork,
    //     },
    //   },
    //   {
    //     fundingDao,
    //     fundingDocDao,
    //     inscriptionBucket,
    //     inscriptionTip,
    //     s3Client,
    //     createMempoolBitcoinClient,
    //   },
    // ) => {
    //   const network = toBitcoinNetworkName(inputNetwork);
    //   const inscriptions = inputFiles.map(fileToInscription);
    //   return createTranscriptionFunding({
    //     address: destinationAddress,
    //     inscriptions,
    //     feeLevel,
    //     feePerByte,
    //     network,
    //     fundingDao,
    //     fundingDocDao,
    //     inscriptionBucket,
    //     createMempoolBitcoinClient,
    //     tip: inscriptionTip,
    //     s3Client,
    //   });
    // },
  },
  Query: {
    axolotlEstimateFee: async (
      _,
      { network, feeLevel, feePerByte, count },
      { createMempoolBitcoinClient },
    ) => {
      const client = createMempoolBitcoinClient({
        network: toBitcoinNetworkName(network),
      });
      return AxolotlModel.estimateFees({
        count: count ?? 1,
        mempool: new MempoolModel(client),
        feeLevel,
        feePerByte,
        tipPerToken: 25000,
      });
    },
    axolotlAvailableOpenEditionFundingClaims: async (_, params, context) => {
      const {
        request: { collectionId, destinationAddress },
      } = params;
      const revealDao = AxolotlModel.createDefaultIncrementingRevealDao();
      const fundings = await revealDao.getAllFundingByAddressCollection({
        address: destinationAddress as `0x${string}`,
        collectionId: collectionId as ID_Collection,
      });

      return fundings.map((funding) => ({
        id: funding.id,
        tokenIds: funding.meta.tokenIds,
        destinationAddress: funding.address,
        status: toGraphqlFundingStatus(funding.fundingStatus),
        funding: new InscriptionFundingModel({
          bucket: context.inscriptionBucket,
          fundingAddress: funding.address,
          id: funding.id,
          s3Client: context.s3Client,
        }),
        network: toGraphqlBitcoinNetworkName(funding.network),
      }));
    },
    // axolotlAvailableClaimedFundingClaims: async (_, params, context) => {
    //   const {
    //     request: { claimingAddress, collectionId },
    //   } = params;
    //   const {
    //     claimsDao,
    //     axolotlAllowanceChainId,
    //     axolotlAllowanceContractAddress,
    //     s3Client,
    //     inscriptionBucket,
    //   } = context;
    //   const revealDao = AxolotlModel.createDefaultIncrementingRevealDao();
    //   const { verified, unverified } = await fetchAllClaimables({
    //     address: claimingAddress as `0x${string}`,
    //     axolotlAllowanceChainId,
    //     axolotlAllowanceContractAddress,
    //     claimsDao,
    //     collectionId,
    //   });

    //   const fundings = await revealDao.getAllFundingByAddressCollection({
    //     address: claimingAddress as `0x${string}`,
    //     collectionId: collectionId as ID_Collection,
    //   });

    //   // using the claiming address and index, match funding addresses to existing claimables
    //   const result: (Omit<AxolotlAvailableClaimedFunding, "funding"> & {
    //     funding?: Maybe<ResolversTypes["InscriptionFunding"]>;
    //   })[] = [];
    //   for (const claimable of verified) {
    //     const funding = fundings.find(
    //       (funding) =>
    //         funding.address === claimable.destinationAddress &&
    //         claimable.index === funding.meta.claimIndex &&
    //         claimingAddress === funding.meta.claimAddress,
    //     );
    //     if (funding) {
    //       funding.fundingStatus;
    //       result.push({
    //         tokenId: funding.meta.tokenId,
    //         claimingAddress,
    //         destinationAddress: funding.address,
    //         network: toGraphqlBitcoinNetworkName(funding.network),
    //         id: funding.id,
    //         status: toGraphqlFundingStatus(funding.fundingStatus),
    //         // we can also attach the funding model here
    //         funding: new InscriptionFundingModel({
    //           id: funding.id,
    //           s3Client,
    //           bucket: inscriptionBucket,
    //           fundingAddress: funding.address,
    //         }),
    //       });
    //     } else {
    //       result.push({
    //         claimingAddress,
    //         destinationAddress: claimable.destinationAddress,
    //         id: `${claimable.destinationAddress}-${claimable.index}`,
    //         status: "UNCLAIMED",
    //       });
    //     }
    //   }
    //   // These are claims that the backend has not processed yet
    //   for (const unverifiedClaim of unverified) {
    //     result.push({
    //       claimingAddress,
    //       destinationAddress: unverifiedClaim.destinationAddress,
    //       id: `unverified-${unverifiedClaim.destinationAddress}-${unverifiedClaim.index}`,
    //       status: "UNVERIFIED",
    //     });
    //   }

    //   return result;
    // },
  },
};
