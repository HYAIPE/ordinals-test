import { ApolloServer } from "apollo-server-lambda";
import fs from "fs";
import { parse } from "graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import {
  createApplication,
  createModule,
} from "@captemulation/graphql-modules";
import { createContext, resolvers } from "@0xflick/ordinals-graphql";
import {
  createLogger,
  deserializeSessionCookie,
  expireSessionCookie,
  serializeSessionCookie,
} from "@0xflick/ordinals-backend";
import type { APIGatewayProxyHandler } from "aws-lambda";
import type { LambdaContextFunctionParams } from "apollo-server-lambda/dist/ApolloServer.js";
import { join } from "path";

const logger = createLogger({
  name: "graphql",
});
const apolloContext = createContext();

function setCookie(
  res: LambdaContextFunctionParams["express"]["res"],
  token: string,
) {
  logger.info("Setting cookie");
  res.setHeader("set-cookie", serializeSessionCookie(token, "/api/"));
}
const typeDefs = parse(
  await fs.promises.readFile(join(__dirname, "./schema.graphql"), "utf8"),
);
const app = createApplication({
  modules: [
    createModule({
      id: "ordinals",
      typeDefs,
      resolvers,
    }),
  ],
});
const executor = app.createApolloExecutor();
const schema = app.schema;

const server = new ApolloServer({
  schema,
  executor,
  context({ express }) {
    return {
      ...apolloContext,
      setToken: (token: string) => setCookie(express.res, token),
      getToken: () => {
        const cookieToken = deserializeSessionCookie(
          express.req.headers.cookie,
        );
        if (cookieToken) {
          return cookieToken;
        }
        const authHeader = express.req.headers.authorization;
        if (authHeader) {
          const [type, token] = authHeader.split(" ");
          if (type === "Bearer") {
            return token;
          }
        }
        return null;
      },
      clearToken: () => {
        logger.info("Clearing cookie");
        express.res.setHeader("set-cookie", expireSessionCookie("/api/"));
      },
    };
  },
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
    {
      async requestDidStart(requestContext) {
        return {
          async didResolveOperation(requestContext) {
            requestContext.context.logger = requestContext.context.logger.child(
              {
                operation: requestContext.request.operationName,
              },
            );
            logger.trace(
              `Request ${requestContext.request.operationName} started`,
            );
          },
          async didResolveSource(requestContext) {
            logger.trace(
              `Request ${requestContext.request.operationName} resolved source`,
            );
          },
          async willSendResponse(requestContext) {
            logger.trace(
              `Request ${requestContext.request.operationName} will send response`,
            );
          },
          async didEncounterErrors() {
            requestContext.errors.forEach((error, i) => {
              logger.warn(
                error,
                `Error number ${i} generated for request ${requestContext.request.operationName}`,
              );
            });
          },
        };
      },
    },
  ],
});

export const handler: APIGatewayProxyHandler = server.createHandler();
