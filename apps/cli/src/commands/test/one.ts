import { v4 as uuid } from "uuid";
import { collectionCreate } from "../collection/create.js";
import { siwe } from "../login/siwe.js";
import { loadWallet, sendBitcoin } from "../../bitcoin.js";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";
import { fundingRequest } from "../funding/request.js";
import { BitcoinNetwork, FeeLevel } from "../../graphql.generated.js";
import {
  watchForFundedEvents,
  watchForFundingEvents,
  watchForGenesisEvents,
} from "../../events/inscriptions.js";

export async function testOne({
  name,
  url,
  claimingAddress,
  chainId,
  scriptName,
  rpcuser,
  rpcpassword,
  rpcwallet,
  network,
}: {
  name?: string;
  url: string;
  scriptName: string;
  claimingAddress: string;
  chainId: number;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
  network: BitcoinNetworkNames;
}) {
  name = name ? `${name}-${uuid()}` : uuid();

  console.log(`Creating collection ${name}...`);
  const token = await siwe({ chainId, url });
  const collectionId = await collectionCreate({
    name,
    maxSupply: 1,
    keyValues: [
      [
        "config",
        JSON.stringify({
          [network]: {
            scriptName: `/content/${scriptName}`,
            revealBlockDelta: 3,
          },
        }),
      ],
    ],
    token,
    url,
  });

  await loadWallet({
    network,
    rpcpassword,
    rpcuser,
    wallet: rpcwallet,
  });

  const bitcoinNetwork = (network: BitcoinNetworkNames) => {
    switch (network) {
      case "regtest":
        return BitcoinNetwork.Regtest;
      case "testnet":
        return BitcoinNetwork.Testnet;
      case "mainnet":
        return BitcoinNetwork.Mainnet;
    }
  };

  const fundings = await fundingRequest({
    request: {
      collectionId,
      network: bitcoinNetwork(network),
      feeLevel: FeeLevel.Medium,
      claimingAddress,
    },
    rpcpassword,
    rpcuser,
    rpcwallet,
    token,
    url,
  });

  const cancelFundingWatch = watchForFundingEvents(collectionId);
  const cancelFundedWatch = watchForFundedEvents(collectionId);
  const cancelGenesisWatch = watchForGenesisEvents(collectionId);

  await sendBitcoin({
    fee_rate: 1,
    network,
    outputs: fundings.map(
      ({ inscriptionFunding: { fundingAddress, fundingAmountBtc } }) => [
        fundingAddress,
        fundingAmountBtc,
      ]
    ),
    rpcpassword,
    rpcuser,
    rpcwallet,
  });

  cancelFundedWatch();
  cancelFundingWatch();
  cancelGenesisWatch();
}
