import {
  DeleteRuleCommand,
  PutRuleCommand,
  PutRuleCommandOutput,
  PutRuleRequest,
  PutTargetsCommand,
  PutTargetsCommandOutput,
  PutTargetsRequest,
  RemoveTargetsCommand,
  EventBridgeClient,
} from "@aws-sdk/client-eventbridge";
import {
  AddPermissionCommand,
  AddPermissionCommandInput,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import type { Logger } from "bunyan";

export async function createRule({
  putRuleRequest,
  putTargetRequest,
  lambdaPermissionRequest,
  eventBridgeClient,
  lambdaClient,
  logger,
}: {
  eventBridgeClient: EventBridgeClient;
  lambdaClient: LambdaClient;
  putRuleRequest: PutRuleRequest;
  putTargetRequest: PutTargetsRequest;
  lambdaPermissionRequest: Omit<
    AddPermissionCommandInput,
    "Action" | "Principal" | "SourceArn"
  >;
  logger: Logger;
}) {
  let ruleResponse: PutRuleCommandOutput | undefined = undefined;
  let cloudWatchEventResponse: PutTargetsCommandOutput | undefined = undefined;
  try {
    ruleResponse = await eventBridgeClient.send(
      new PutRuleCommand(putRuleRequest)
    );

    cloudWatchEventResponse = await eventBridgeClient.send(
      new PutTargetsCommand(putTargetRequest)
    );

    await lambdaClient.send(
      new AddPermissionCommand({
        ...lambdaPermissionRequest,
        Action: "lambda:InvokeFunction",
        Principal: "events.amazonaws.com",
        SourceArn: ruleResponse.RuleArn!,
      })
    );
  } catch (error) {
    logger.error(error, "Failed to create rule");
    if (!cloudWatchEventResponse) {
      await eventBridgeClient.send(
        new RemoveTargetsCommand({
          Rule: putTargetRequest.Rule,
          Ids: putTargetRequest.Targets.map((target) => target.Id),
        })
      );
    }
    if (!ruleResponse) {
      await eventBridgeClient.send(
        new DeleteRuleCommand({
          Name: putRuleRequest.Name!,
        })
      );
    }
    throw error;
  }
}
