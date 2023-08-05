import { ApolloError } from "apollo-server-errors";

export enum EReason {
  INVALID_NONCE = "INVALID_NONCE",
  "INVALID_SIGNATURE" = "INVALID_SIGNATURE",
  "NOT_AUTHORIZED" = "NOT_AUTHORIZED",
  "NOT_AUTHENTICATED" = "NOT_AUTHENTICATED",
}

export type TReason = keyof typeof EReason;

export class AuthError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
