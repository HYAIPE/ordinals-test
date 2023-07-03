import { IMetadataFetchEvent } from "@0xflick/models";
import {
  EventBridgeClient,
  EventBridgeClientConfig,
} from "@aws-sdk/client-eventbridge";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { createLogger } from "../utils";

const logger = createLogger({
  name: "backend/events/bus",
});


export async function emitMetadataEvent({
  event,
  eventBridge,
  eventBusName,
  source,
}: {
  event: IMetadataFetchEvent;
  eventBridge: EventBridgeClient;
  eventBusName?: string;
  source: string;
}) {
  try {
    // Emit the event
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: source,
          DetailType: event.DetailType,
          Detail: JSON.stringify(event.Detail),
        },
      ],
    });
    logger.info(
      `Sending event ${event.DetailType} to EventBridge for job ${event.Detail.jobId}`
    );
    const response = await eventBridge.send(command);
    logger.info(
      `Event ${event.DetailType} sent to EventBridge for job ${
        event.Detail.jobId
      }: ${response.Entries.map((e) => e.EventId).join(", ")}`
    );
    return response;
  } catch (error) {
    logger.error(
      { err: error, detail: event.Detail },
      `Failed to send event ${event.DetailType} to EventBridge`
    );
    throw error;
  }
},
