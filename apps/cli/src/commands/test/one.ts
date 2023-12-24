import { v4 as uuid } from "uuid";
import { frameConnector } from "@0xflick/frame";
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
  watchForClaimedEvents,
  watchForFundedEvents,
  watchForFundingEvents,
  watchForGenesisEvents,
} from "../../events/inscriptions.js";
import {
  iAllowanceAbi,
  watchForFunded,
  watchForFundings,
  watchForGenesis,
} from "@0xflick/ordinals-backend";
import { createMempoolBitcoinClient } from "../../mempool.js";
import { mainnet, sepolia, base } from "@wagmi/core/chains";
import { config, promiseClaimEvent } from "../../wagmi.js";
import {
  connect,
  getBlockNumber,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { retryWithBackOff } from "@0xflick/inscriptions";

export async function testOne({
  name,
  url,
  chainId,
  scriptName,
  rpcuser,
  rpcpassword,
  rpcwallet,
  network,
  bitcoinDataDir,
  skipClaim,
}: {
  name?: string;
  url: string;
  scriptName: string;
  chainId: number;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
  network: BitcoinNetworkNames;
  bitcoinDataDir: string;
  skipClaim?: boolean;
}) {
  name = name ? `${name}-${uuid()}` : uuid();

  const bitcoinAddress = await generateOrdinalAddress({
    network,
    bitcoinDataDir,
  });

  console.log(`Claiming address: ${bitcoinAddress}`);

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

  const connected = await connect(config, {
    connector: frameConnector(),
  });
  const claimingAddress = connected.accounts[0];
  if (!claimingAddress) throw new Error("No connected account");
  const chain = [mainnet, sepolia, base].find((chain) => chain.id === chainId);

  if (!chain) throw new Error(`Chain ${chainId} not found`);
  const blockHeight = await getBlockNumber(config, {
    chainId: chain.id,
  });
  if (!skipClaim) {
    const promiseClaimedProcessed = promiseClaimEvent({
      contractAddress: "0x8297AA011A99244A571190455CE61846806BF0ce",
      chainId: chain.id,
    });
    // add a test allowance
    const allowanceResult = await writeContract(config, {
      chainId: chain.id,
      address: "0x8297AA011A99244A571190455CE61846806BF0ce",
      abi: iAllowanceAbi,
      functionName: "claim",
      args: [[bitcoinAddress]],
    });

    console.log(`Test allowance txid: ${allowanceResult}`);

    await promiseClaimedProcessed;

    await waitForTransactionReceipt(config, {
      hash: allowanceResult,
      chainId: chain.id,
    });
    console.log(`Test allowance processed`);
  }

  await watchForClaimedEvents({
    chainId: chain.id,
    collectionId,
    contractAddress: "0x8297AA011A99244A571190455CE61846806BF0ce",
    startBlockHeight: skipClaim ? 3904660 : Number(blockHeight) - 10,
  });

  console.log(`Claimed event watcher caught up?`);
  await new Promise((resolve) => setTimeout(resolve, 14000));

  await loadWallet({
    network,
    rpcpassword,
    rpcuser,
    wallet: rpcwallet,
    bitcoinDataDir,
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
    token,
    url,
  });

  const fundingMap = new Map<
    string,
    {
      funding: { address: string; amount: string; txid: string };
      funded?: Parameters<Parameters<typeof watchForFundings>[1]>[0];
      genesis?: Parameters<Parameters<typeof watchForFunded>[1]>[0];
      reveal?: Parameters<Parameters<typeof watchForGenesis>[1]>[0];
    }
  >();

  const { txid } = await sendBitcoin({
    fee_rate: 1,
    network,
    outputs: fundings.map(
      ({ inscriptionFunding: { fundingAddress, fundingAmountBtc } }) => [
        fundingAddress,
        fundingAmountBtc,
      ],
    ),
    rpcpassword,
    rpcuser,
    rpcwallet,
    bitcoinDataDir,
  });
  const mempoolClient = createMempoolBitcoinClient({
    network,
  });

  const fundingTx = await retryWithBackOff(
    () => mempoolClient.transactions.getTx({ txid }),
    10,
    100,
  );
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

  const cancelFundingWatch = new Promise<() => void>((resolve, reject) => {
    const cancel = watchForFundingEvents(collectionId, (funded) => {
      const { address } = funded;
      // for each noticed funding, take note of the txid so that we can watch for the funded events, then resolve the promise
      if (!fundingMap.has(address)) {
        return reject(new Error(`Address ${address} not found in funding map`));
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
        return reject(new Error(`Address ${address} not found in funding map`));
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
        return reject(new Error(`Address ${address} not found in funding map`));
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
