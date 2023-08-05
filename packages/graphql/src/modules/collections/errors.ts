import { ApolloError } from "apollo-server-errors";

export type TReason = "COLLECTION_ALREADY_EXISTS";

function reasonToMessage(reason: TReason): string {
  switch (reason) {
    case "COLLECTION_ALREADY_EXISTS":
      return "Collection already exists";
    default:
      return "Unknown error";
  }
}

export class CollectionError extends ApolloError {
  constructor(reason: TReason, message?: string) {
    const reasonMessage = reasonToMessage(reason);
    super(message ? `${reasonMessage}: ${reason}` : reasonMessage);
  }
}
