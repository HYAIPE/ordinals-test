import { ApolloError } from "apollo-server-errors";

export type TReason = "COLLECTION_ALREADY_EXISTS" | "INVALID_METADATA";

function reasonToMessage(reason: TReason): string {
  switch (reason) {
    case "COLLECTION_ALREADY_EXISTS":
      return "Collection already exists";
    case "INVALID_METADATA":
      return "Invalid metadata";
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
