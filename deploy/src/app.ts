#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import path from "path";
import { fileURLToPath } from "url";
import { BackendStack } from "./stack.js";
import { BitcoinExeStack, BitcoinStack } from "./bitcoin/stack.js";
import { ElectrsDeploymentStack } from "./bitcoin/electrs-build.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

new BackendStack(app, "ordinal-backend", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});

new BitcoinExeStack(app, "bitcoin-exe", {
  network: "testnet",
  localArchivePath: path.join(
    __dirname,
    "../bitcoin/bitcoin-26.0-aarch64-linux-gnu.tar.gz",
  ),
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2",
  },
});

new BitcoinStack(app, "bitcoin-testnet", {
  localArchivePath: path.join(
    __dirname,
    "../bitcoin/bitcoin-26.0-aarch64-linux-gnu.tar.gz",
  ),
  network: "testnet",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2",
  },
});

new ElectrsDeploymentStack(app, "electrs-build", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2",
  },
});
