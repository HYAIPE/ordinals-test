import { BrowserProvider, verifyMessage } from "ethers";
import ethProvider from "eth-provider";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../graphql.generated.js";
import { createJweRequest } from "@0xflick/ordinals-rbac-models";

export async function siwe({ chainId, url }: { chainId: number; url: string }) {
  const client = new GraphQLClient(url);
  const sdk = getSdk(client);
  const frame = ethProvider("frame");
  const provider = new BrowserProvider(frame, chainId);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  console.log(`Address: ${address}`);
  const {
    nonceEthereum: { nonce, messageToSign, pubKey },
  } = await sdk.EthereumNonce({ address, chainId });
  const signature = await signer.signMessage(messageToSign);

  const jwe = await createJweRequest({
    nonce,
    signature,
    pubKeyStr: pubKey,
  });

  const {
    siwe: { token },
  } = await sdk.SIWE({
    address,
    jwe,
  });
  console.log(`Token: ${token}`);
  frame.close();
}
