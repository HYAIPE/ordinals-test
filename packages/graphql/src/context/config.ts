import {
  awsEndpoint,
  awsRegion,
  inscriptionBucket,
} from "@0xflick/ordinals-backend";

export interface IConfigContext {
  awsEndpoint?: string;
  awsRegion?: string;
  inscriptionBucket: string;
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
  };
}
