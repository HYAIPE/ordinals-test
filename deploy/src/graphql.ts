import { Construct } from "constructs";
import { parse } from "dotenv";
import { buildSync } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigw2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { textFromSecret } from "./utils/files.js";
import { copyFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TableNames {
  readonly rbac: string;
  readonly userNonce: string;
  readonly funding: string;
  readonly claims: string;
  readonly openEditionClaims: string;
}

interface ConfigEnv {
  INSCRIPTION_BUCKET: string;
  TABLE_NAMES: TableNames;
}

interface SecretEnv {
  DEPLOYMENT: string;
  AXOLOTL_INSCRIPTION_TIP_DESTINATION: string;
  AXOLOTL_ALLOWANCE_CONTRACT_ADDRESS: string;
  AXOLOTL_ALLOWANCE_CHAIN_ID: string;
  AUTH_MESSAGE_DOMAIN: string;
  AUTH_MESSAGE_EXPIRATION_TIME_SECONDS: string;
  AUTH_MESSAGE_JWT_CLAIM_ISSUER: string;
  AUTH_MESSAGE_JWK: string;
  AUTH_MESSAGE_PUBLIC_KEY: string;
  ETHEREUM_DEFAULT_CHAIN_ID: string;
  SEPOLIA_ENS_REGISTRY_ADDRESS: string;
  SEPOLIA_ENS_UNIVERSAL_RESOLVER_ADDRESS: string;
  SEPOLIA_ENS_ADMIN: string;
  SEPOLIA_RPC_URL: string;
  BASE_RPC_URL: string;
  BASE_WS_RPC_URL: string;
  BASE_ENS_ADMIN: string;
  MAINNET_RPC_URL: string;
  MAINNET_ENS_ADMIN: string;
  TESTNET_MEMPOOL_URL: string;
}

function withSecretEnv(secretsFile: string) {
  return parse(textFromSecret(secretsFile));
}

function compileGraphql() {
  const outfile = path.join(cdk.FileSystem.mkdtemp("graphql"), "index.mjs");
  buildSync({
    entryPoints: [
      path.join(__dirname, "../../apps/functions/src/lambdas/graphql.ts"),
    ],
    outfile,
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    external: ["aws-sdk"],
    inject: [path.join(__dirname, "./esbuild/cjs-shim.ts")],
    sourcemap: true,
  });
  const finalDir = path.dirname(outfile);
  copyFileSync(
    path.join(__dirname, "../../packages/graphql/schema.graphql"),
    path.join(finalDir, "schema.graphql"),
  );
  return finalDir;
}

interface GraphqlProps {
  readonly domainName: string;
  readonly rbacTable: dynamodb.ITable;
  readonly userNonceTable: dynamodb.ITable;
  readonly fundingTable: dynamodb.ITable;
  readonly claimsTable: dynamodb.ITable;
  readonly openEditionClaimsTable: dynamodb.ITable;
  readonly inscriptionBucket?: s3.IBucket;
}

export class Graphql extends Construct {
  readonly api: apigw2.HttpApi;
  constructor(
    scope: Construct,
    id: string,
    {
      domainName,
      claimsTable,
      fundingTable,
      openEditionClaimsTable,
      rbacTable,
      userNonceTable,
      inscriptionBucket,
    }: GraphqlProps,
  ) {
    super(scope, id);

    const graphqlCodeDir = compileGraphql();

    inscriptionBucket =
      inscriptionBucket ??
      new s3.Bucket(this, "InscriptionBucket", {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });

    const graphqlLambda = new lambda.Function(this, "GraphqlHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(graphqlCodeDir),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        LOG_LEVEL: "debug",
        TABLE_NAMES: JSON.stringify({
          rbac: rbacTable.tableName,
          userNonce: userNonceTable.tableName,
          funding: fundingTable.tableName,
          claims: claimsTable.tableName,
          openEditionClaims: openEditionClaimsTable.tableName,
        }),
        INSCRIPTION_BUCKET: inscriptionBucket.bucketName,
        ...withSecretEnv(`${domainName}/.env.graphql`),
      },
    });

    rbacTable.grantReadWriteData(graphqlLambda);
    userNonceTable.grantReadWriteData(graphqlLambda);
    fundingTable.grantReadWriteData(graphqlLambda);
    claimsTable.grantReadWriteData(graphqlLambda);
    openEditionClaimsTable.grantReadWriteData(graphqlLambda);
    inscriptionBucket.grantReadWrite(graphqlLambda);

    const httpApi = new apigw2.HttpApi(this, "HttpApi", {
      description: "This service serves graphql.",
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [
          apigw2.CorsHttpMethod.OPTIONS,
          apigw2.CorsHttpMethod.GET,
          apigw2.CorsHttpMethod.POST,
        ],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"],
      },
    });
    this.api = httpApi;
    httpApi.addRoutes({
      path: "/api/graphql",
      methods: [
        apigw2.HttpMethod.POST,
        apigw2.HttpMethod.GET,
        apigw2.HttpMethod.OPTIONS,
      ],
      integration: new HttpLambdaIntegration(
        "GraphqlIntegration",
        graphqlLambda,
      ),
    });
  }
}
