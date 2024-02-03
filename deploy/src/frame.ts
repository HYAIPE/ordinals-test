import { Construct } from "constructs";
import { buildSync } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigw2 from "aws-cdk-lib/aws-apigatewayv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { copyFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function prepareDockerBuild(filename: string) {
  const outfile = path.join(cdk.FileSystem.mkdtemp("esbuild"), "index.mjs");
  buildSync({
    entryPoints: [
      path.join(__dirname, `../../apps/functions/src/lambdas/${filename}.ts`),
    ],
    outfile,
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    external: ["aws-sdk", "canvas"],
    inject: [path.join(__dirname, "./esbuild/cjs-shim.ts")],
    sourcemap: true,
  });
  const finalDir = path.dirname(outfile);
  copyFileSync(
    path.join(__dirname, `../canvas/Dockerfile`),
    `${finalDir}/Dockerfile`,
  );
  return finalDir;
}

interface IProps {
  imageDomainName: string;
}

export class Frame extends Construct {
  readonly api: apigw2.HttpApi;
  readonly finalBucket: s3.Bucket;
  constructor(scope: Construct, id: string, { imageDomainName }: IProps) {
    super(scope, id);

    const assetBucket = new s3.Bucket(this, "AxolotlAssetBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new s3deploy.BucketDeployment(this, "DeployAssets", {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, "../../packages/assets/properties"),
        ),
      ],
      destinationBucket: assetBucket,
    });
    const seedBucket = new s3.Bucket(this, "SeedBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.finalBucket = seedBucket;
    const teaserDockerDir = prepareDockerBuild("frame-render-teaser-axolotl");
    const teaserHandler = new lambda.DockerImageFunction(
      this,
      "FrameTeaserHandler",
      {
        code: lambda.DockerImageCode.fromImageAsset(teaserDockerDir, {
          cmd: ["index.handler"],
        }),
        memorySize: 512,
        timeout: cdk.Duration.seconds(10),
        environment: {
          ASSET_BUCKET: assetBucket.bucketName,
          SEED_BUCKET: seedBucket.bucketName,
          IMAGE_HOST: imageDomainName,
        },
      },
    );
    assetBucket.grantRead(teaserHandler);
    seedBucket.grantReadWrite(teaserHandler);

    const qrDockerDir = prepareDockerBuild("frame-render-qrcode");
    const qrCodeHandler = new lambda.DockerImageFunction(
      this,
      "FrameQrCodeHandler",
      {
        code: lambda.DockerImageCode.fromImageAsset(qrDockerDir, {
          cmd: ["index.handler"],
        }),
        memorySize: 256,
        timeout: cdk.Duration.seconds(5),
        environment: {
          SEED_BUCKET: seedBucket.bucketName,
          IMAGE_HOST: imageDomainName,
        },
      },
    );
    seedBucket.grantReadWrite(qrCodeHandler);

    const httpApi = new apigw2.HttpApi(this, "Canvas", {
      description: "This service serves image generating routes.",
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
      path: "/frame-og/axolotl/{seed}",
      methods: [apigw2.HttpMethod.GET, apigw2.HttpMethod.OPTIONS],
      integration: new HttpLambdaIntegration(
        "frame-og-teaser-axolotl",
        teaserHandler,
      ),
    });
    httpApi.addRoutes({
      path: "/frame-og/qr/{address}/{amount}",
      methods: [apigw2.HttpMethod.GET, apigw2.HttpMethod.OPTIONS],
      integration: new HttpLambdaIntegration("frame-qr", qrCodeHandler),
    });

    const imageApiUrl = cdk.Fn.select(
      1,
      cdk.Fn.split("//", httpApi.apiEndpoint),
    );

    const cachePolicy = new cloudfront.CachePolicy(this, "image-cache-policy", {
      defaultTtl: cdk.Duration.days(30),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.days(30),
    });
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "ImageSiteCertificate",
      "arn:aws:acm:us-east-1:590183800463:certificate/41d7891b-7aa7-4f00-aa7f-08004ea5bcbd",
    );
    const imageSite = new cloudfront.Distribution(this, "ImageSite", {
      domainNames: [imageDomainName],
      certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(seedBucket),
        compress: false,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "frame-og/*": {
          origin: new origins.HttpOrigin(imageApiUrl, {
            originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    new cdk.CfnOutput(this, "ImageSiteUrl", {
      value: imageSite.distributionDomainName,
    });
  }
}
