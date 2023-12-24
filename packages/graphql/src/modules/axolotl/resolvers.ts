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
import { fileToInscription, toGraphqlFundingStatus } from "./transforms.js";
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
import {
  AxolotlAvailableClaimedFunding,
  FeeLevel,
  InputMaybe,
  Maybe,
  ResolversTypes,
} from "../../generated-types/graphql.js";
import { MempoolModel } from "../bitcoin/models.js";
import { contractAllowanceStrategy, openEditionStrategy } from "./strategy.js";
import { bitcoinToSats } from "@0xflick/inscriptions";
import { AxolotlError } from "./errors.js";
import { fetchAllClaimables } from "./controllers.js";

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
    network,
    contentIds: writableInscriptions.map((inscription) => inscription.tapkey),
    fundingStatus: "funding",
    timesChecked: 0,
    fundingAmountBtc,
    fundingAmountSat: Number(bitcoinToSats(fundingAmountBtc)),
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
    axolotlFundingClaimRequest: async (
      _,
      {
        request: {
          claimingAddress,
          network,
          feeLevel,
          feePerByte,
          collectionId,
        },
      },
      context,
    ) => {
      const inscriptions = await contractAllowanceStrategy(context, {
        address: claimingAddress as `0x${string}`,
        collectionId: collectionId as ID_Collection,
        inscriptionFactory: async (requests) => {
          return await Promise.all(
            requests.map(async ({ destinationAddress, index }) => {
              const {
                inscriptionBucket,
                axolotlInscriptionTip,
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
                tip: axolotlInscriptionTip,
                s3Client: context.s3Client,
                claimAddress: claimingAddress,
                claimIndex: index,
              });

              return axolotlModel;
            }),
          );
        },
      });
      if (inscriptions.length === 0) {
        throw new AxolotlError("No available claims", "NO_CLAIM_FOUND");
      }
      return inscriptions.map(({ claimable, inscriptionDoc }) => ({
        chameleon: inscriptionDoc.chameleon,
        createdAt: new Date().toISOString(),
        id: inscriptionDoc.id,
        destinationAddress: claimable.destinationAddress,
        tokenId: inscriptionDoc.tokenId,
        inscriptionFunding: inscriptionDoc.inscriptionFunding,
      }));
    },
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
      const inscriptions = await openEditionStrategy(context, {
        claimCount: claimCount ?? 1,
        destinationAddress: destinationAddress as `0x${string}`,
        collectionId: collectionId as ID_Collection,
        async inscriptionFactory(requests) {
          return await Promise.all(
            requests.map(async ({ destinationAddress, index }) => {
              const {
                inscriptionBucket,
                axolotlInscriptionTip,
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
                tip: axolotlInscriptionTip,
                s3Client: context.s3Client,
                claimIndex: index,
              });

              return axolotlModel;
            }),
          );
        },
      });
      if (inscriptions.length === 0) {
        throw new AxolotlError("No available claims", "NO_CLAIM_FOUND");
      }
      return inscriptions.map(({ claimable, inscriptionDoc }) => ({
        chameleon: inscriptionDoc.chameleon,
        createdAt: new Date().toISOString(),
        id: inscriptionDoc.id,
        destinationAddress: claimable.destinationAddress,
        tokenId: inscriptionDoc.tokenId,
        inscriptionFunding: inscriptionDoc.inscriptionFunding,
      }));
    },
    requestFundingAddress: async (
      _,
      {
        request: {
          destinationAddress,
          files: inputFiles,
          feeLevel,
          feePerByte,
          network: inputNetwork,
        },
      },
      {
        fundingDao,
        fundingDocDao,
        inscriptionBucket,
        inscriptionTip,
        s3Client,
        createMempoolBitcoinClient,
      },
    ) => {
      const network = toBitcoinNetworkName(inputNetwork);
      const inscriptions = inputFiles.map(fileToInscription);
      return createTranscriptionFunding({
        address: destinationAddress,
        inscriptions,
        feeLevel,
        feePerByte,
        network,
        fundingDao,
        fundingDocDao,
        inscriptionBucket,
        createMempoolBitcoinClient,
        tip: inscriptionTip,
        s3Client,
      });
    },
  },
  Query: {
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
        tokenId: funding.meta.tokenId,
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
    axolotlAvailableClaimedFundingClaims: async (_, params, context) => {
      const {
        request: { claimingAddress, collectionId },
      } = params;
      const {
        claimsDao,
        axolotlAllowanceChainId,
        axolotlAllowanceContractAddress,
        s3Client,
        inscriptionBucket,
      } = context;
      const revealDao = AxolotlModel.createDefaultIncrementingRevealDao();
      const { verified, unverified } = await fetchAllClaimables({
        address: claimingAddress as `0x${string}`,
        axolotlAllowanceChainId,
        axolotlAllowanceContractAddress,
        claimsDao,
        collectionId,
      });

      const fundings = await revealDao.getAllFundingByAddressCollection({
        address: claimingAddress as `0x${string}`,
        collectionId: collectionId as ID_Collection,
      });

      // using the claiming address and index, match funding addresses to existing claimables
      const result: (Omit<AxolotlAvailableClaimedFunding, "funding"> & {
        funding?: Maybe<ResolversTypes["InscriptionFunding"]>;
      })[] = [];
      for (const claimable of verified) {
        const funding = fundings.find(
          (funding) =>
            funding.address === claimable.destinationAddress &&
            claimable.index === funding.meta.claimIndex &&
            claimingAddress === funding.meta.claimAddress,
        );
        if (funding) {
          funding.fundingStatus;
          result.push({
            tokenId: funding.meta.tokenId,
            claimingAddress,
            destinationAddress: funding.address,
            network: toGraphqlBitcoinNetworkName(funding.network),
            id: funding.id,
            status: toGraphqlFundingStatus(funding.fundingStatus),
            // we can also attach the funding model here
            funding: new InscriptionFundingModel({
              id: funding.id,
              s3Client,
              bucket: inscriptionBucket,
              fundingAddress: funding.address,
            }),
          });
        } else {
          result.push({
            claimingAddress,
            destinationAddress: claimable.destinationAddress,
            id: `${claimable.destinationAddress}-${claimable.index}`,
            status: "UNCLAIMED",
          });
        }
      }
      // These are claims that the backend has not processed yet
      for (const unverifiedClaim of unverified) {
        result.push({
          claimingAddress,
          destinationAddress: unverifiedClaim.destinationAddress,
          id: `unverified-${unverifiedClaim.destinationAddress}-${unverifiedClaim.index}`,
          status: "UNVERIFIED",
        });
      }

      return result;
    },
  },
};
