import {
  IFundingDao,
  IFundingDocDao,
  MempoolClient,
  createInscriptionTransaction,
} from "@0xflick/ordinals-backend";
import {
  decryptJweToken,
  createJwtTokenSingleSubject,
} from "@0xflick/ordinals-rbac";
import { Address, Signer } from "@0xflick/tapscript";
import { verifyMessage } from "ethers";
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
  authMessageBitcoin,
  authMessageEthereum,
} from "@0xflick/ordinals-models";
import { AxolotlModel } from "../axolotl/models.js";
import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { MempoolModel } from "../bitcoin/models.js";
import { addressToBitcoinNetwork } from "../user/resolvers.js";
import { Web3LoginUserModel, Web3UserModel } from "../user/models.js";

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
    nonceEthereum: async (
      _,
      { address, chainId },
      {
        userDao,
        authMessageDomain,
        authMessageExpirationTimeSeconds,
        authMessageJwtClaimIssuer,
      },
    ) => {
      const now = Date.now();
      const expirationTime = new Date(
        now + authMessageExpirationTimeSeconds * 1000,
      ).toISOString();
      const issuedAt = new Date(now).toISOString();
      const nonce = await userDao.create({
        address,
        domain: authMessageDomain,
        expiresAt: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
        chainId,
      });

      const messageToSign = authMessageEthereum({
        address,
        chainId,
        nonce,
        domain: authMessageDomain,
        expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
      });

      return {
        nonce,
        messageToSign,
        domain: authMessageDomain,
        expiration: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
        chainId,
        pubKey: process.env.AUTH_MESSAGE_PUBLIC_KEY!,
      };
    },
    nonceBitcoin: async (
      _,
      { address },
      {
        userDao,
        authMessageDomain,
        authMessageExpirationTimeSeconds,
        authMessageJwtClaimIssuer,
      },
    ) => {
      const now = Date.now();
      const expirationTime = new Date(
        now + authMessageExpirationTimeSeconds * 1000,
      ).toISOString();
      const issuedAt = new Date(now).toISOString();
      const nonce = await userDao.create({
        address,
        domain: authMessageDomain,
        expiresAt: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
      });

      const messageToSign = authMessageBitcoin({
        address,
        nonce,
        domain: authMessageDomain,
        expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        network: addressToBitcoinNetwork(address),
      });

      return {
        nonce,
        messageToSign,
        domain: authMessageDomain,
        expiration: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        pubKey: process.env.AUTH_MESSAGE_PUBLIC_KEY!,
      };
    },
    siwe: async (
      _,
      { address, jwe },
      { authMessageDomain, authMessageJwtClaimIssuer, userDao },
    ) => {
      const { protectedHeader, plaintext } = await decryptJweToken(jwe);
      const signature = Buffer.from(plaintext).toString("utf8");
      const nonce = protectedHeader.kid!;
      const userNonceRequest = await userDao.get(address, nonce);
      if (!userNonceRequest) {
        throw new Error("Invalid nonce");
      }
      const { domain, expiresAt, issuedAt, uri, version, chainId } =
        userNonceRequest;

      if (domain !== authMessageDomain) {
        throw new Error("Invalid domain");
      }
      if (uri !== authMessageJwtClaimIssuer) {
        throw new Error("Invalid uri");
      }
      if (version !== "1") {
        throw new Error("Invalid version");
      }
      if (expiresAt < new Date().toISOString()) {
        throw new Error("Expired nonce");
      }

      const messageToSign = authMessageEthereum({
        address,
        chainId: chainId!,
        domain,
        expirationTime: expiresAt,
        issuedAt,
        uri,
        version: version!,
        nonce,
      });
      const recoveredAddress = verifyMessage(messageToSign, signature);
      if (recoveredAddress !== address) {
        throw new Error("Invalid signature");
      }
      const token = await createJwtTokenSingleSubject({
        user: {
          address,
          roleIds: [] as string[],
        },
        nonce,
      });
      return new Web3LoginUserModel({
        address,
        token,
      });
    },
    siwb: async (
      _,
      { address, jwe },
      { authMessageDomain, authMessageJwtClaimIssuer, userDao },
    ) => {
      const { protectedHeader, plaintext } = await decryptJweToken(jwe);
      const signature = Buffer.from(plaintext).toString("utf8");
      const nonce = protectedHeader.kid!;
      const userNonceRequest = await userDao.get(address, nonce);
      if (!userNonceRequest) {
        throw new Error("Invalid nonce");
      }
      const { domain, expiresAt, issuedAt, uri, version, chainId } =
        userNonceRequest;

      if (domain !== authMessageDomain) {
        throw new Error("Invalid domain");
      }
      if (uri !== authMessageJwtClaimIssuer) {
        throw new Error("Invalid uri");
      }
      if (expiresAt < new Date().toISOString()) {
        throw new Error("Expired nonce");
      }

      const messageToSign = authMessageBitcoin({
        address,
        domain,
        expirationTime: expiresAt,
        issuedAt,
        uri,
        nonce,
        network: addressToBitcoinNetwork(address),
      });
      Signer.taproot.verify(
        signature,
        Buffer.from(messageToSign).toString("hex"),
        Address.decode(address).data,
        true,
      );
      const token = await createJwtTokenSingleSubject({
        user: {
          address,
          roleIds: [] as string[],
        },
        nonce,
      });
      return new Web3LoginUserModel({
        address,
        token,
      });
    },
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
