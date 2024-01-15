import { S3Client } from "@aws-sdk/client-s3";
import { InscriptionFundingModel } from "./models.js";
import { IFundingDao, IFundingDocDao } from "@0xflick/ordinals-backend";
import { BitcoinNetworkNames } from "@0xflick/ordinals-models";

export async function getUrl({
  network,
  id,
  bitcoinRegtestMempoolEndpoint,
  bitcoinTestnetMempoolEndpoint,
  bitcoinMainnetMempoolEndpoint,
}: {
  network: BitcoinNetworkNames;
  id: string;
  bitcoinRegtestMempoolEndpoint: string;
  bitcoinTestnetMempoolEndpoint: string;
  bitcoinMainnetMempoolEndpoint: string;
}) {
  switch (network) {
    case "regtest":
      return `${bitcoinRegtestMempoolEndpoint}/tx/${id}`;
    case "testnet":
      return `${bitcoinTestnetMempoolEndpoint}/testnet/tx/${id}`;
    case "mainnet":
      return `${bitcoinMainnetMempoolEndpoint}/tx/${id}`;
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

export async function getFundingModel({
  id,
  fundingDao,
  fundingDocDao,
  inscriptionBucket,
  s3Client,
}: {
  id: string;
  fundingDao: IFundingDao;
  fundingDocDao: IFundingDocDao;
  inscriptionBucket: string;
  s3Client: S3Client;
}) {
  const funding = await fundingDao.getFunding(id);
  const document = await fundingDocDao.getInscriptionTransaction({
    id,
    fundingAddress: funding.address,
  });
  return new InscriptionFundingModel({
    id,
    document,
    bucket: inscriptionBucket,
    fundingAddress: funding.address,
    s3Client,
  });
}
