import {
  IFundingDao,
  IFundingDocDao,
  MempoolClient,
  createInscriptionTransaction,
} from "@0xflick/ordinals-backend";
import { MutationModule } from "./generated-types/module-types.js";
import { toBitcoinNetworkName } from "../bitcoin/transforms.js";
import { fileToInscription } from "./transforms.js";
import { estimateFeesWithMempool } from "../bitcoin/fees.js";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import {
  AddressInscriptionModel,
  BitcoinNetworkNames,
  IInscriptionDocFundingWait,
  InscriptionContent,
} from "@0xflick/ordinals-models";
import { AxolotlModel } from "../axolotl/models.js";
import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { MempoolModel } from "../bitcoin/models.js";

async function createTranscriptionFunding({
  address,
  inscriptions,
  feeLevel,
  feePerByte,
  network,
  fundingDao,
  fundingDocDao,
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
    status,
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
    meta: {},
  });
  const doc: IInscriptionDocFundingWait = {
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
    status,
    totalFee,
    writableInscriptions,
    tip,
  };
  const inscriptionFundingModel = new InscriptionFundingModel({
    id: addressModel.id,
    bucket: inscriptionBucket,
    document: doc,
  });
  await Promise.all([
    fundingDocDao.updateOrSaveInscriptionTransaction(doc),
    fundingDao.createFunding(addressModel),
    ...files.map((f) => fundingDocDao.saveInscriptionContent(f)),
  ]);
  return inscriptionFundingModel;
}

export const resolvers: MutationModule.Resolvers = {
  Mutation: {
    axolotlFundingAddressRequest: async (
      _,
      {
        request: {
          destinationAddress,
          network,
          feeLevel,
          feePerByte,
          proof,
          request,
        },
      },
      context,
    ) => {
      const {
        axolotlInscriptionBucket,
        axolotlInscriptionTip,
        fundingDocDao,
        createMempoolBitcoinClient,
      } = context;
      const axolotlModel = await AxolotlModel.create({
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
        inscriptionBucket: axolotlInscriptionBucket,
        tip: axolotlInscriptionTip,
      });

      return {
        chameleon: axolotlModel.chameleon,
        createdAt: new Date().toISOString(),
        id: axolotlModel.inscriptionDocument.id,
        originAddress: destinationAddress,
        tokenId: axolotlModel.tokenId,
        inscriptionFunding: axolotlModel.inscriptionFunding,
        proof,
        request,
      };
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
      });
    },
  },
};
