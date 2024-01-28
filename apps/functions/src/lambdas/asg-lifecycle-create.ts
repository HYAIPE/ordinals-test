import { SNSHandler } from "aws-lambda";
import { handleLifecycleCreate } from "../asg/lifecycle-create.js";
import {
  AutoScalingClient,
  CompleteLifecycleActionCommand,
} from "@aws-sdk/client-auto-scaling";

const documentName = process.env.LAMBDA_ASG_LIFECYCLE_DOCUMENT;

if (!documentName) {
  throw new Error("LAMBDA_ASG_LIFECYCLE_DOCUMENT must be set");
}

const timeoutInSeconds = process.env.LAMBDA_ASG_LIFECYCLE_TIMEOUT;
if (timeoutInSeconds && isNaN(parseInt(timeoutInSeconds))) {
  throw new Error("LAMBDA_ASG_LIFECYCLE_TIMEOUT must be an integer");
}
const timeout = timeoutInSeconds ? parseInt(timeoutInSeconds) : undefined;

export const handler: SNSHandler = async (event) => {
  await Promise.all(
    event.Records.map(async (record) => {
      const message = JSON.parse(record.Sns.Message);
      const instanceId = message.EC2InstanceId;
      const lifecycleHookName = message.LifecycleHookName;
      const autoScalingGroupName = message.AutoScalingGroupName;
      const token = message.LifecycleActionToken;
      try {
        await handleLifecycleCreate({
          instanceId,
          lifecycleHookName,
          autoScalingGroupName,
          token,
          documentName,
          timeout,
        });
      } catch (e) {
        const asgClient = new AutoScalingClient({});
        await asgClient.send(
          new CompleteLifecycleActionCommand({
            AutoScalingGroupName: autoScalingGroupName,
            LifecycleActionResult: "ABANDON",
            LifecycleHookName: lifecycleHookName,
            LifecycleActionToken: token,
            InstanceId: instanceId,
          }),
        );
      }
    }),
  );
};
