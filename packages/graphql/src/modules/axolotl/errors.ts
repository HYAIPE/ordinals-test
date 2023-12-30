import { ApolloError } from "apollo-server-errors";

export enum EReason {
  NO_CLAIM_FOUND = "NO_CLAIM_FOUND",
  NO_COLLECTION_FOUND = "NO_COLLECTION_FOUND",
  USER_OPEN_EDITION_LIMIT_REACHED = "USER_OPEN_EDITION_LIMIT_REACHED",
  UNABLE_TO_CLAIM_ANY_MORE = "UNABLE_TO_CLAIM_ANY_MORE",
}

export type TReason = keyof typeof EReason;

export class AxolotlError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
