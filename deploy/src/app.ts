#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import path from "path";
import { fileURLToPath } from "url";
import { BackendStack } from "./stack.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

new BackendStack(app, "ordinal-backend", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
