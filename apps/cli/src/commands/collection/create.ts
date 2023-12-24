import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../graphql.generated.js";
import { RequestConfig } from "graphql-request/build/esm/types.js";
import { ID_Collection } from "@0xflick/ordinals-models";

function createClient(
  endpoint: string,
  requestConfig?: RequestConfig,
): GraphQLClient {
  return new GraphQLClient(endpoint, requestConfig);
}

export async function collectionCreate({
  name,
  maxSupply,
  keyValues,
  url,
  token,
}: {
  name: string;
  maxSupply: number;
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
    },
  );
  const sdk = getSdk(client);
  const {
    createCollection: { id: collectionId },
  } = await sdk.CreateCollection({
    input: {
      maxSupply,
      name,
    },
  });

  console.log(`Collection ID: ${collectionId}`);

  if (keyValues.length > 0) {
    console.log("Setting metadata...");
    await sdk.UpdateMetadata({
      id: collectionId,
      metadata: keyValues.map(([key, value]) => ({
        key,
        value,
      })),
    });
  }
  console.log("Done!");
  return collectionId as ID_Collection;
}
