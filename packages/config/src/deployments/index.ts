import { TDeployment } from "../types.js";
import { awsConfig as defaultAwsConfig } from "./default.js";
import { awsConfig as localAwsConfig } from "./local.js";
import { awsConfig as awsAwsConfig } from "./aws.js";
import { lazySingleton } from "../lazy.js";

export function getAwsConfig(_deployment?: TDeployment) {
  switch (_deployment ?? deployment.get()) {
    case "localstack":
      return localAwsConfig;
    case "aws":
      return awsAwsConfig;
    default:
      return defaultAwsConfig;
  }
}

export const deployment = lazySingleton(() => {
  if (!process.env.DEPLOYMENT) {
    throw new Error("DEPLOYMENT env var not defined");
  }
  if (!["localstack", "aws"].includes(process.env.DEPLOYMENT)) {
    throw new Error(`${process.env.DEPLOYMENT} is not one of localstack, aws`);
  }
  return process.env.DEPLOYMENT;
});
