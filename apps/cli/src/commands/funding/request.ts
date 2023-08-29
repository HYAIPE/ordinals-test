import { GraphQLClient } from "graphql-request";
import {
  getSdk,
  AxolotlRequest,
  BitcoinNetwork,
} from "../../graphql.generated.js";
import { RequestConfig } from "graphql-request/build/esm/types.js";
import { loadWallet, sendBitcoin } from "../../bitcoin.js";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";

function createClient(
  endpoint: string,
  requestConfig?: RequestConfig
): GraphQLClient {
  return new GraphQLClient(endpoint, requestConfig);
}

export async function fundingRequest({
  request,
  rpcpassword,
  rpcuser,
  rpcwallet,
  url,
  token,
}: {
  request: AxolotlRequest;
  url: string;
  token: string | null;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
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
  const { axolotlFundingAddressRequest } = await sdk.AxolotlFundingRequest({
    request,
  });
  const network: BitcoinNetworkNames = (() => {
    switch (request.network) {
      case BitcoinNetwork.Regtest:
        return "regtest";
      case BitcoinNetwork.Testnet:
        return "testnet";
      case BitcoinNetwork.Mainnet:
        return "mainnet";
    }
  })();

  // for (const { inscriptionFunding } of axolotlFundingAddressRequest) {
  //   console.log(`Funding address: ${inscriptionFunding.fundingAddress}`);
  //   console.log(`Funding amount BTC: ${inscriptionFunding.fundingAmountBtc}`);
  //   console.log(`Funding amount sats: ${inscriptionFunding.fundingAmountSats}`);
  //   console.log(`Funding address ID: ${inscriptionFunding.id}`);

  //   return inscriptionFunding;
  // }

  return axolotlFundingAddressRequest;
}
