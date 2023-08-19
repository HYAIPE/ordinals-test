import { address, crypto } from "bitcoinjs-lib";

export function addressToScriptHash(bitcoinAddress: string) {
  const script = address.toOutputScript(bitcoinAddress);
  const hash = crypto.sha256(script);
  return Buffer.from(hash.reverse());
}
