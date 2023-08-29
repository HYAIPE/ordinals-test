import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../graphql.generated.js";
import { RequestConfig } from "graphql-request/build/esm/types.js";

function createClient(
  endpoint: string,
  requestConfig?: RequestConfig
): GraphQLClient {
  return new GraphQLClient(endpoint, requestConfig);
}

export async function collectionUpdate({
  id,
  keyValues,
  url,
  token,
}: {
  id: string;
  keyValues: [string, string][];
  url: string;
  token: string | null;
}) {
  const client = createClient(
    url,
    token && {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  const sdk = getSdk(client);

  await sdk.UpdateMetadata({
    id,
    metadata: keyValues.map(([key, value]) => ({
      key,
      value,
    })),
  });

  console.log("Done!");
}
