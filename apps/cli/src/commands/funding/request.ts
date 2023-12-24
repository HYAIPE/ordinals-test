import { GraphQLClient } from "graphql-request";
import { getSdk, AxolotlClaimRequest } from "../../graphql.generated.js";
import { RequestConfig } from "graphql-request/build/esm/types.js";

function createClient(
  endpoint: string,
  requestConfig?: RequestConfig,
): GraphQLClient {
  return new GraphQLClient(endpoint, requestConfig);
}

export async function fundingRequest({
  request,
  url,
  token,
}: {
  request: AxolotlClaimRequest;
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
  const { axolotlFundingClaimRequest } = await sdk.AxolotlFundingRequest({
    request,
  });

  for (const { inscriptionFunding } of axolotlFundingClaimRequest) {
    console.log(`Funding address: ${inscriptionFunding.fundingAddress}`);
    console.log(`Funding amount BTC: ${inscriptionFunding.fundingAmountBtc}`);
    console.log(`Funding amount sats: ${inscriptionFunding.fundingAmountSats}`);
    console.log(`Funding address ID: ${inscriptionFunding.id}`);
  }

  return axolotlFundingClaimRequest;
}
