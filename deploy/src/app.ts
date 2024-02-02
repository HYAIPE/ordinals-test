#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import path from "path";
import { fileURLToPath } from "url";
import { BackendStack } from "./stack.js";
import {
  BitcoinExeStack,
  BitcoinStack,
  MariaDbStack,
} from "./bitcoin/stack.js";
import { ElectrsDeploymentStack } from "./bitcoin/electrs-build.js";
import { AuroraServerlessV2Stack } from "./bitcoin/aurora.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

new BackendStack(app, "ordinals", {
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

// new AuroraServerlessV2Stack(app, "aurora-mysql", {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: "us-west-2",
//   },
// });

new MariaDbStack(app, "mariadb", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2",
  },
});
