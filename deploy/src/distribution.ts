import path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as apigw2 from "aws-cdk-lib/aws-apigatewayv2";
import { fileURLToPath } from "url";
import fs from "fs";
import { parse } from "dotenv";
import { Nextjs } from "cdk-nextjs-standalone";
import { textFromSecret } from "./utils/files.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface IProps {
  noCert?: boolean;
  domain: string | [string, string];
  graphqlApi: apigw2.IHttpApi;
}

export class Www extends Construct {
  constructor(scope: Construct, id: string, props: IProps) {
    const { noCert, domain, graphqlApi } = props;
    super(scope, id);

    const domains = domain instanceof Array ? domain : [domain];
    const domainName = domains.join(".");

    const environment = parse(textFromSecret(`${domainName}/.env.www`));
    const graphqlApiUrl = cdk.Fn.select(
      1,
      cdk.Fn.split("//", graphqlApi.apiEndpoint),
    );

    const site = new Nextjs(this, "Web", {
      ...(!noCert
        ? {
            domainProps: {
              domainName,
            },
          }
        : {}),
      overrides: {
        nextjsDistribution: {
          distributionProps: {
            additionalBehaviors: {
              "api/graphql": {
                origin: new origins.HttpOrigin(graphqlApiUrl, {
                  originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
                  protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                }),
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
                cachePolicy: new cloudfront.CachePolicy(
                  this,
                  "apiCacheDisabled",
                  {
                    cookieBehavior: cloudfront.CacheCookieBehavior.all(),
                    queryStringBehavior:
                      cloudfront.CacheQueryStringBehavior.none(),
                    headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
                      "Authorization",
                      "Content-Type",
                      "Accept",
                    ),
                  },
                ),
                viewerProtocolPolicy:
                  cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              },
            },
          },
        },
      },
      nextjsPath: "../apps/www",
      environment: {
        ...environment,
        NEXT_PUBLIC_GRAPHQL_ENDPOINT: "/api/graphql",
      },
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: site.url,
    });
  }
}
