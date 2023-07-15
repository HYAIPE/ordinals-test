export interface ISigningRequestEthereum {
  domain: string;
  address: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

export function authMessageEthereum({
  domain,
  address,
  uri,
  version,
  chainId,
  nonce,
  issuedAt,
  expirationTime,
}: ISigningRequestEthereum) {
  return `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Expiration Time: ${expirationTime}
Issued At: ${issuedAt}`;
}

export interface ISigningRequestBitcoin {
  domain: string;
  address: string;
  uri: string;
  network: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

export function authMessageBitcoin({
  domain,
  address,
  uri,
  network,
  nonce,
  issuedAt,
  expirationTime,
}: ISigningRequestBitcoin) {
  return `${domain} wants you to sign in with your Bitcoin account:
${address}

URI: ${uri}
Network: ${network}
Nonce: ${nonce}
Expiration Time: ${expirationTime}
Issued At: ${issuedAt}`;
}
