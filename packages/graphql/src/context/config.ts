import {
  awsEndpoint,
  awsRegion,
  inscriptionBucket,
  mainnetMempoolUrl,
  regtestMempoolUrl,
  testnetMempoolUrl,
  tableNames,
} from "@0xflick/ordinals-backend";
import { lazySingleton } from "@0xflick/ordinals-models";

export const axolotlInscriptionBucket = lazySingleton(() => {
  return process.env.AXOLOTL_INSCRIPTION_BUCKET || "inscriptions";
});

export const axolotlInscriptionTip = lazySingleton(() => {
  const envNum = Number(process.env.AXOLOTL_INSCRIPTION_TIP);
  return Number.isInteger(envNum) ? envNum : 0;
});

export const inscriptionTip = lazySingleton(() => {
  const envNum = Number(process.env.INSCRIPTION_TIP);
  return Number.isInteger(envNum) ? envNum : 0;
});

export const authMessageDomain = lazySingleton(() => {
  if (!process.env.AUTH_MESSAGE_DOMAIN) {
    throw new Error("AUTH_MESSAGE_DOMAIN not set");
  }
  return process.env.AUTH_MESSAGE_DOMAIN;
});

export const authMessageExpirationTimeSeconds = lazySingleton(() => {
  const time = Number(process.env.AUTH_MESSAGE_EXPIRATION_TIME_SECONDS);
  if (!Number.isInteger(time)) {
    throw new Error("AUTH_MESSAGE_EXPIRATION_TIME_SECONDS not set");
  }
  return Number(process.env.AUTH_MESSAGE_EXPIRATION_TIME_SECONDS);
});

export const authMessageJwtClaimIssuer = lazySingleton(() => {
  if (!process.env.AUTH_MESSAGE_JWT_CLAIM_ISSUER) {
    throw new Error("AUTH_MESSAGE_JWT_CLAIM_ISSUER not set");
  }
  return process.env.AUTH_MESSAGE_JWT_CLAIM_ISSUER;
});

export interface IConfigContext {
  awsEndpoint?: string;
  awsRegion?: string;
  inscriptionBucket: string;
  inscriptionTip: number;
  axolotlInscriptionBucket: string;
  axolotlInscriptionTip: number;
  bitcoinRegtestMempoolEndpoint: string;
  bitcoinTestnetMempoolEndpoint: string;
  bitcoinMainnetMempoolEndpoint: string;
  authMessageDomain: string;
  authMessageExpirationTimeSeconds: number;
  authMessageJwtClaimIssuer: string;
  tableNames: Record<string, string>;
}
export function createConfigContext(): IConfigContext {
  return {
    get awsEndpoint() {
      return awsEndpoint.get();
    },
    get awsRegion() {
      return awsRegion.get();
    },
    get inscriptionBucket() {
      return inscriptionBucket.get();
    },
    get inscriptionTip() {
      return inscriptionTip.get();
    },
    get axolotlInscriptionBucket() {
      return axolotlInscriptionBucket.get();
    },
    get axolotlInscriptionTip() {
      return axolotlInscriptionTip.get();
    },
    get bitcoinRegtestMempoolEndpoint() {
      return regtestMempoolUrl.get();
    },
    get bitcoinTestnetMempoolEndpoint() {
      return testnetMempoolUrl.get();
    },
    get bitcoinMainnetMempoolEndpoint() {
      return mainnetMempoolUrl.get();
    },
    get authMessageDomain() {
      return authMessageDomain.get();
    },
    get authMessageExpirationTimeSeconds() {
      return authMessageExpirationTimeSeconds.get();
    },
    get authMessageJwtClaimIssuer() {
      return authMessageJwtClaimIssuer.get();
    },
    get tableNames() {
      return tableNames.get();
    },
  };
}
