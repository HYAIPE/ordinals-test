import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { createLogger } from "../utils/logger.js";

const logger = createLogger({
  name: "backend/events/bus",
});

export async function emitMetadataEvent<T>({
  event,
  eventBridge,
  eventBusName,
  source,
}: {
  event: {
    DetailType: string;
    Detail: T;
  };
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
    logger.debug(`Sending event ${event.DetailType} to EventBridge`);
    const response = await eventBridge.send(command);
    logger.debug(
      `Event ${event.DetailType} sent to EventBridge: ${response.Entries?.map(
        (e) => e.EventId
      ).join(", ")}`
    );
    return response;
  } catch (error) {
    logger.error(
      { err: error, detail: event.Detail },
      `Failed to send event ${event.DetailType} to EventBridge`
    );
    throw error;
  }
}
