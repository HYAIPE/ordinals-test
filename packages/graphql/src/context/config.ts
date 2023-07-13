import {
  awsEndpoint,
  awsRegion,
  inscriptionBucket,
  mainnetMempoolUrl,
  regtestMempoolUrl,
  testnetMempoolUrl,
} from "@0xflick/ordinals-backend";
import { lazySingleton } from "@0xflick/ordinals-models";

export const axolotlInscriptionBucket = lazySingleton(() => {
  return process.env.AXOLOTL_INSCRIPTION_BUCKET || "inscriptions";
});

export interface IConfigContext {
  awsEndpoint?: string;
  awsRegion?: string;
  inscriptionBucket: string;
  axolotlInscriptionBucket: string;
  bitcoinRegtestMempoolEndpoint: string;
  bitcoinTestnetMempoolEndpoint: string;
  bitcoinMainnetMempoolEndpoint: string;
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
    get axolotlInscriptionBucket() {
      return axolotlInscriptionBucket.get();
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
  };
}
