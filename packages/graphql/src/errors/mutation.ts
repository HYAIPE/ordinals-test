import { ApolloError } from "apollo-server-errors";

export enum EReason {
  REQUIRE_MUTATION = "REQUIRE_MUTATION",
}

export type TReason = keyof typeof EReason;

export class MutationError extends ApolloError {
  constructor(
    message: string = "Must be a mutation",
    reason: TReason = "REQUIRE_MUTATION"
  ) {
    super(message, reason);
  }
}
