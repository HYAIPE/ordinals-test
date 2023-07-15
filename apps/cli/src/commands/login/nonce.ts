import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../graphql.generated.js";

function createClient(endpoint: string): GraphQLClient {
  return new GraphQLClient(endpoint);
}

export async function nonceBitcoin({
  address,
  url,
}: {
  address: string;
  url: string;
}) {
  const client = createClient(url);
  const sdk = getSdk(client);
  const response = await sdk.BitcoinNonce({ address });
  console.log(`Nonce: ${response.nonceBitcoin.nonce}`);
  console.log(`Message to sign: ${response.nonceBitcoin.messageToSign}`);
}

export async function nonceEthereum({
  address,
  chainId,
  url,
}: {
  address: string;
  chainId: number;
  url: string;
}) {
  const client = createClient(url);
  const sdk = getSdk(client);
  const response = await sdk.EthereumNonce({ address, chainId });
  console.log(`Nonce: ${response.nonceEthereum.nonce}`);
  console.log(`Message to sign: ${response.nonceEthereum.messageToSign}`);
}
