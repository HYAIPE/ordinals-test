import { v4 as uuid } from "uuid";
import { collectionCreate } from "../collection/create.js";
import { siwe } from "../login/siwe.js";
import {
  generateOrdinalAddress,
  loadWallet,
  sendBitcoin,
} from "../../bitcoin.js";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";
import { fundingRequest } from "../funding/request.js";
import { BitcoinNetwork, FeeLevel } from "../../graphql.generated.js";
import {
  watchForFundedEvents,
  watchForFundingEvents,
  watchForGenesisEvents,
} from "../../events/inscriptions.js";
import {
  prepareWriteTestAllowance,
  watchForFunded,
  watchForFundings,
  watchForGenesis,
  writeTestAllowance,
} from "@0xflick/ordinals-backend";
import { createMempoolBitcoinClient } from "../../mempool.js";
import ethProvider from "eth-provider";
import { mainnet, sepolia, goerli } from "@wagmi/chains";
import { createWalletClient, custom } from "viem";
import { frameConnector, promiseClaimEvent } from "../../wagmi.js";

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

  const bitcoinAddress = await generateOrdinalAddress({
    network,
  });

  console.log(`Claiming address: ${bitcoinAddress}`);

  console.log(`Creating collection ${name}...`);
  const token = await siwe({ chainId, url });

  const frame = ethProvider("frame");
  const chain = [mainnet, sepolia, goerli].find(
    (chain) => chain.id === chainId
  );
  if (!chain) throw new Error(`Chain ${chainId} not found`);
  await frameConnector.connect({ chainId });
  const walletClient = createWalletClient({
    chain,
    transport: custom(frame),
  });
  const promiseClaimedProcessed = promiseClaimEvent({
    contractAddress: "0x8297AA011A99244A571190455CE61846806BF0ce",
    chainId,
  });
  // add a test allowance
  const allowanceConfig = await prepareWriteTestAllowance({
    chainId,
    account: claimingAddress,
    address: "0x8297AA011A99244A571190455CE61846806BF0ce",
    functionName: "claim",
    walletClient,
    args: [[bitcoinAddress]],
  });
  const testAllowanceResult = await writeTestAllowance({
    ...allowanceConfig,
    walletClient,
  });
  console.log(`Test allowance txid: ${testAllowanceResult.hash}`);
  await promiseClaimedProcessed;
  console.log(`Test allowance processed`);
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

  console.log(JSON.stringify(fundings, null, 2));

  const fundingMap = new Map<
    string,
    {
      funding: { address: string; amount: string; txid: string };
      funded?: Parameters<Parameters<typeof watchForFundings>[1]>[0];
      genesis?: Parameters<Parameters<typeof watchForFunded>[1]>[0];
      reveal?: Parameters<Parameters<typeof watchForGenesis>[1]>[0];
    }
  >();
  const cancelFundingWatch = new Promise<() => void>((resolve, reject) => {
    const cancel = watchForFundingEvents(collectionId, (funded) => {
      const { address } = funded;
      // for each noticed funding, take note of the txid so that we can watch for the funded events, then resolve the promise
      if (!fundingMap.has(address)) {
        reject(new Error(`Address ${address} not found in funding map`));
      }
      const funding = fundingMap.get(address)!;
      funding.funded = funded;
      // check all fundings to see if they are all funded
      for (const funding of fundingMap.values()) {
        if (!funding.funded) return;
      }
      resolve(cancel);
    });
  });
  const cancelFundedWatch = new Promise<() => void>((resolve, reject) => {
    const cancel = watchForFundedEvents(collectionId, (genesis) => {
      const { address } = genesis;
      // now for each genesis event, update the funding map
      if (!fundingMap.has(address)) {
        reject(new Error(`Address ${address} not found in funding map`));
      }
      const funding = fundingMap.get(address)!;
      funding.genesis = genesis;
      // check all fundings to see if they are all funded
      for (const funding of fundingMap.values()) {
        if (!funding.genesis) return;
      }
      resolve(cancel);
    });
  });
  const cancelGenesisWatch = new Promise<() => void>((resolve, reject) => {
    const cancel = watchForGenesisEvents(collectionId, (reveal) => {
      const { address } = reveal;
      if (!fundingMap.has(address)) {
        reject(new Error(`Address ${address} not found in funding map`));
      }
      const funding = fundingMap.get(address)!;
      funding.reveal = reveal;
      // check all fundings to see if they are all funded
      for (const funding of fundingMap.values()) {
        if (!funding.reveal) return;
      }
      resolve(cancel);
    });
  });

  const { txid } = await sendBitcoin({
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
  const mempoolClient = createMempoolBitcoinClient({
    network,
  });

  const fundingTx = await mempoolClient.transactions.getTx({ txid });
  for (const {
    inscriptionFunding: { fundingAddress, fundingAmountBtc },
  } of fundings) {
    fundingMap.set(fundingAddress, {
      funding: {
        address: fundingAddress,
        amount: fundingAmountBtc,
        txid,
      },
    });
  }

  console.log(`Funding tx: ${fundingTx.txid}`);

  const cancels = await Promise.all([
    cancelFundedWatch,
    cancelFundingWatch,
    cancelGenesisWatch,
  ]);
  for (const cancel of cancels) {
    console.log("cancelling watch");
    cancel();
  }
}
