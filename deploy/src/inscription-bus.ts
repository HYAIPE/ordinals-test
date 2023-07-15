import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { buildSync } from "esbuild";

interface NftMetadataBusProps {
  lambdas?: boolean;
}

export class InscriptionsBus extends Construct {
  readonly ordinalEventBus: events.EventBus;
  readonly newFundingRequestQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: NftMetadataBusProps) {
    const { lambdas = true } = props;
    super(scope, id);

    // Create the custom EventBridge event bus
    const ordinalEventBus = new events.EventBus(this, "OrdinalEventBus");
    this.ordinalEventBus = ordinalEventBus;

    // Create the SQS queues for metadata fetch and metadata query operations
    const newFundingRequestQueue = new sqs.Queue(
      this,
      "NewFundingRequestQueue"
    );
    this.newFundingRequestQueue = newFundingRequestQueue;

    // Create the EventBridge rule for metadata fetch events
    const newFundingStartRule = new events.Rule(
      this,
      "MetadataFetchStartRule",
      {
        eventBus: ordinalEventBus,
        eventPattern: {
          detailType: ["ordinal_funding_request_start"],
        },
      }
    );
    newFundingStartRule.addTarget(
      new events_targets.SqsQueue(newFundingRequestQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    if (lambdas) {
      const fundingRequestStartLambda = new lambda.Function(
        this,
        "MetadataFetchStartLambda",
        {
          runtime: lambda.Runtime.NODEJS_16_X,
          handler: "index.handler",
          code: lambda.Code.fromAsset("../../apps/functions", {
            bundling: {
              local: {
                tryBundle(outputDir: string) {
                  const result = buildSync({
                    entryPoints: ["./src/event/fundingStart.ts"],
                    outfile: `${outputDir}/index.js`,
                    bundle: true,
                    platform: "node",
                    target: "node16",
                    format: "esm",
                    external: ["aws-sdk"],
                  });
                  return !!result;
                },
              },
              image: lambda.Runtime.NODEJS_18_X.bundlingImage,
            },
          }),
          timeout: cdk.Duration.seconds(5),
        }
      );
    }

    new cdk.CfnOutput(this, "OrdinalEventBusName", {
      value: ordinalEventBus.eventBusName,
    });
    new cdk.CfnOutput(this, "NewFundingRequestQueueUrl", {
      value: newFundingRequestQueue.queueUrl,
    });
  }
}
