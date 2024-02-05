import { Address, Tx, Tap, Signer } from "@0xflick/tapscript";
import {
  BitcoinNetworkNames,
  generatePrivKey,
  networkNamesToTapScriptName,
} from "@0xflick/inscriptions";
import { KeyPair } from "@0xflick/crypto-utils";

export function generateReceiverAddress({
  network,
}: {
  network: BitcoinNetworkNames;
}) {
  const privKey = generatePrivKey();
  const secKey = new KeyPair(privKey);
  const pubkey = secKey.pub.x;
  const [tpubkey] = Tap.getPubKey(pubkey);
  const address = Address.p2tr.encode(
    tpubkey,
    networkNamesToTapScriptName(network),
  );

  console.log(`privKey: ${privKey}`);
  console.log(`address: ${address}`);
}
