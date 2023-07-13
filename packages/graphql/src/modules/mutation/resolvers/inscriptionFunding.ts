import { IFundingDao, IFundingDocDao, MempoolClient, createInscriptionTransaction } from "@0xflick/ordinals-backend";
import { MutationModule } from "./../generated-types/module-types.js";
import { toBitcoinNetworkName } from "../../bitcoin/transforms.js";
import { fileToInscription } from "./../transforms.js";
import { estimateFeesWithMempool } from "../../bitcoin/fees.js";
import { InscriptionFundingModel } from "../../inscriptionFunding/models.js";
import {
  AddressInscriptionModel,
  BitcoinNetworkNames,
  IInscriptionDocFundingWait,
  InscriptionContent,
} from "@0xflick/ordinals-models";
import { AxolotlModel } from "../../axolotl/models.js";
import { FeeLevel, InputMaybe } from "../../../generated-types/graphql.js";
import { FundingDao } from "@0xflick/ordinals-backend/src/dynamodb/funding.js";
import { MempoolModel } from "../../bitcoin/models.js";

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
}: {
  address: string;
  inscriptions: InscriptionContent[];
  feeLevel?: InputMaybe<FeeLevel>;
  feePerByte?: InputMaybe<number>;
  network: BitcoinNetworkNames;
  fundingDao: IFundingDao;
  fundingDocDao: IFundingDocDao;
  inscriptionBucket: string;
  createMempoolBitcoinClient: (opts: {
    network: BitcoinNetworkNames;
  }) => MempoolClient["bitcoin"];
}) {
  const finalFee = await estimateFeesWithMempool({
    mempoolBitcoinClient: createMempoolBitcoinClient({
      network,
    }),
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
    tip: 0,
    inscriptions,
  });

  const addressModel = new AddressInscriptionModel({
    address: fundingAddress,
    network,
    contentIds: writableInscriptions.map((inscription) => inscription.tapkey),
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
    axolotlFundingAddressRequest: async (_, { request: { destinationAddress, network, feeLevel, feePerByte, }}, context, info) => {
      const {
        axolotlInscriptionBucket,
        fundingDocDao,
        createMempoolBitcoinClient
      } = context;
      const axolotlModel = AxolotlModel.create({
        incrementingRevealDao: AxolotlModel.createDefaultIncrementingRevealDao(new FundingDao()),
        network: toBitcoinNetworkName(network),
        mempool: new MempoolModel(createMempoolBitcoinClient({ network: toBitcoinNetworkName(network) })),
      })



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
        createMempoolBitcoinClient,
      },
    ) => {
      const network = toBitcoinNetworkName(inputNetwork);
      const inscriptions = inputFiles.map(fileToInscription)
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
      });
    }
};
