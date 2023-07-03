import type { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import {
  INewFundingAddressEvent,
  INewFundingAddressModel,
} from "@0xflick/ordinals-models";
import { emitMetadataEvent } from "../bus.js";

export async function emitEventFundingStart({
  eventBridge,
  details,
  source,
}: {
  details: INewFundingAddressModel;
  eventBridge: EventBridgeClient;
  source: string;
}) {
  const event: INewFundingAddressEvent = {
    type: "ordinal_funding_request_start",
    details: details,
  };
  const response = await emitMetadataEvent({
    event,
    eventBridge,
    source,
  });
  return response;
}
