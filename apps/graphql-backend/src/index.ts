import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import {
  createGraphqlApplication,
  createContext,
} from "@0xflick/ordinals-graphql";
import {
  deserializeSessionCookie,
  expireSessionCookie,
  serializeSessionCookie,
} from "@0xflick/ordinals-backend";

const app = await createGraphqlApplication();
const executor = app.createApolloExecutor();
const schema = app.schema;

const apolloServer = new ApolloServer({
  schema,
  executor,
  context: ({ req, res }) => {
    return {
      ...createContext(),
      getToken: () => {
        const cookieToken = deserializeSessionCookie(req.headers.cookie);
        if (cookieToken) {
          return cookieToken;
        }
        const authHeader = req.headers.authorization;
        if (authHeader) {
          const [type, token] = authHeader.split(" ");
          if (type === "Bearer") {
            return token;
          }
        }
        return null;
      },
      setToken: (token: string) => {
        res.setHeader("set-cookie", serializeSessionCookie(token, "/"));
      },
      clearToken: () => {
        res.setHeader("set-cookie", expireSessionCookie("/"));
      },
    };
  },
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  },
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

const { url } = await apolloServer.listen();
console.log(`🚀 Server ready at ${url}`);
