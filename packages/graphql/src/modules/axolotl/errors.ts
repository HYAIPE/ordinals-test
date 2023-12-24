import { ApolloError } from "apollo-server-errors";

export enum EReason {
  NO_CLAIM_FOUND = "NO_CLAIM_FOUND",
  NO_COLLECTION_FOUND = "NO_COLLECTION_FOUND",
}

export type TReason = keyof typeof EReason;

export class AxolotlError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
