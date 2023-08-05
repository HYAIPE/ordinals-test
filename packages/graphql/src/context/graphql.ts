import { GraphQLResolveInfo, OperationTypeNode } from "graphql";
import { MutationError } from "../errors/mutation.js";

export type IGraphqlContext = {
  isMutation(info: GraphQLResolveInfo): boolean;
  requireMutation(info: GraphQLResolveInfo): void;
};

export function createGraphqlContext(): IGraphqlContext {
  const self = {
    isMutation(info: GraphQLResolveInfo): boolean {
      return info.operation.operation === OperationTypeNode.MUTATION;
    },
    requireMutation(info: GraphQLResolveInfo): void {
      if (!self.isMutation(info)) {
        throw new MutationError();
      }
    },
  };
  return self;
}
