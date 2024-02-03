import type { IAwsConfig } from "../types.js";

const region = process.env.AWS_REGION ?? "us-east-1";

// aws
export const awsConfig: IAwsConfig = {
  region,
};
