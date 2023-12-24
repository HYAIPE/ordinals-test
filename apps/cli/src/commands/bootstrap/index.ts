import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../graphql.generated.js";
import { siwe } from "../login/siwe.js";

export async function bootstrap({
  adminAddress,
  chainId,
  url,
}: {
  adminAddress: `0x${string}`;
  chainId: number;
  url: string;
}) {
  const token = await siwe({ chainId, url });
  const client = new GraphQLClient(url);
  const sdk = getSdk(client);
  const createRoleResponse = await sdk.CreateRole(
    {},
    {
      authorization: `Bearer ${token}`,
    },
  );

  const roleId = createRoleResponse.createRole.id;

  await sdk.BindRoleToUSer(
    {
      address: adminAddress,
      roleId,
    },
    {
      authorization: `Bearer ${token}`,
    },
  );

  console.log("Done!");
}
