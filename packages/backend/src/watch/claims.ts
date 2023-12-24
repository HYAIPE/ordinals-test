import { IObservedClaim } from "@0xflick/ordinals-models";
import { wagmi } from "@0xflick/ordinals-config";
import Bottleneck from "bottleneck";
import { createLogger } from "@0xflick/ordinals-backend";
import { Address } from "@0xflick/tapscript";
import { Log } from "viem";
import { iAllowanceAbi } from "../wagmi/generated.js";
import { ClaimsDao } from "../index.js";
import { clientForChain } from "./viem.js";
import { watchContractEvent } from "@wagmi/core";

const logger = createLogger({
  name: "watchClaimedEvents",
});
const claimEventAbi = iAllowanceAbi[0];
type ClaimedEvent = typeof claimEventAbi;
type ClaimedEventLog = Log<bigint, number, false, ClaimedEvent, undefined>;

interface IObservableContract {
  contractAddress: `0x${string}`;
  chainId: number;
  startBlockHeight: number;
}

const limiter = new Bottleneck({
  maxConcurrent: 2,
});

const GET_LOG_BLOCK_REQUEST_SIZE = 10000;

const fetchLogsInChunks = async ({
  collectionIds,
  contractAddress,
  chainId,
  claimsDao,
  observedBlockHeight,
}: {
  contractAddress: `0x${string}`;
  chainId: number;
  claimsDao: ClaimsDao;
  observedBlockHeight: number;
  collectionIds: string[];
}) => {
  logger.info(
    { contractAddress, chainId, observedBlockHeight },
    "fetching logs in chunks",
  );
  const client = clientForChain(chainId);
  let currentStartBlock = observedBlockHeight;
  const currentBlockHeight = Number(await client.getBlockNumber());

  while (currentStartBlock <= currentBlockHeight) {
    const endBlock = Math.min(
      currentStartBlock + GET_LOG_BLOCK_REQUEST_SIZE,
      currentBlockHeight,
    );
    logger.info(
      `catching up on ${contractAddress}#${chainId} from ${currentStartBlock} to ${endBlock}`,
    );
    const logs = await client.getLogs({
      fromBlock: BigInt(currentStartBlock),
      toBlock: BigInt(endBlock),
      address: contractAddress,
      event: claimEventAbi,
    });

    logger.info(`Found ${logs.length} logs.`);

    const claims = collectionIds
      .map((collectionId) =>
        prepForStorage({
          events: logs,
          observable: {
            contractAddress,
            chainId,
            startBlockHeight: currentStartBlock,
            collectionId,
          },
        }),
      )
      .flat();
    await updateStorage({
      chainId,
      claimsDao,
      contractAddress,
      observedClaims: claims,
      fromBlockHeight: endBlock,
    });
    currentStartBlock = endBlock + 1;
  }
};

async function catchUp({
  observables,
  claimsDao,
  collectionIds,
}: {
  observables: IObservableContract[];
  claimsDao: ClaimsDao;
  collectionIds: string[];
}) {
  // explode out all observables by all collectionIds
  const observablesWithCollectionIds = observables.reduce(
    (memo, observable) => {
      return memo.concat(
        collectionIds.map((collectionId) => ({
          ...observable,
          collectionId,
        })),
      );
    },
    [] as {
      contractAddress: `0x${string}`;
      chainId: number;
      startBlockHeight: number;
      collectionId: string;
    }[],
  );
  // organize the observables by `${contractAddress}#${chainId}` and max block height
  // for each of them, get all events from the last block height to the current block height
  const info = await claimsDao.batchGetLastObservedBlockHeight({
    observedContracts: observablesWithCollectionIds,
  });

  logger.info(`Found ${info.length} observables in the database.`);

  // because not every contract necessarily exists in the database, we need to
  // add back in entries for contracts that have never been queried before.
  //
  // for these we will use an observedBlockHeight of 0, which will cause us to
  // query all events from genesis to now.

  const missing = observablesWithCollectionIds.filter(
    (observable) =>
      !info.find(
        (entry) =>
          entry.contractAddress === observable.contractAddress &&
          entry.chainId === observable.chainId,
      ),
  );

  if (missing.length > 0) {
    logger.info(
      `Found ${missing.length} observables that have never been queried before.`,
    );
  }

  for (const observable of missing) {
    info.push({
      contractAddress: observable.contractAddress as `0x${string}`,
      chainId: observable.chainId,
      observedBlockHeight: observable.startBlockHeight,
      collectionId: observable.collectionId,
    });
  }

  const rateLimitedFetchLogsInChunks = limiter.wrap(fetchLogsInChunks);

  await Promise.all(
    info.map(async (contractInfo) => {
      return await rateLimitedFetchLogsInChunks({
        ...contractInfo,
        claimsDao,
        collectionIds,
      });
    }),
  );
}

function prepForStorage({
  events,
  observable,
}: {
  events: ClaimedEventLog[];
  observable: IObservableContract & { collectionId: string };
}) {
  const observedClaims = events.reduce((memo, event) => {
    if (
      !event.args._address ||
      !event.args._claims ||
      event.blockNumber === null
    ) {
      return memo;
    }

    const addressThatClaimed = event.args._address;
    const allAddressesClaimed = event.args._claims;
    const startIndexForClaims = Number(event.args._startIndex);
    let currentIndex = startIndexForClaims;

    let validClaims: IObservedClaim[] = [];

    for (const address of allAddressesClaimed) {
      if (Address.decode(address).type === "p2tr") {
        validClaims.push({
          claimedAddress: addressThatClaimed,
          chainId: observable.chainId,
          contractAddress: observable.contractAddress as `0x${string}`,
          destinationAddress: address,
          index: currentIndex,
          observedBlockHeight: Number(event.blockNumber),
          collectionId: observable.collectionId,
        });
      }
      currentIndex++;
    }

    return memo.concat(validClaims);
  }, [] as IObservedClaim[]);

  return observedClaims;
}

export async function updateStorage({
  claimsDao,
  observedClaims,
}: {
  contractAddress: `0x${string}`;
  chainId: number;
  claimsDao: ClaimsDao;
  fromBlockHeight?: number;
  observedClaims: (IObservedClaim & { collectionId: string })[];
}) {
  await claimsDao.batchUpdateObservedClaims({
    observedClaims,
  });
}

export async function watchForAllowance({
  collectionIds,
  observables,
  claimsDao,
}: {
  collectionIds: string[];
  observables: IObservableContract[];
  claimsDao: ClaimsDao;
}) {
  const watches = observables.map(
    ({ chainId, contractAddress, startBlockHeight }) => {
      return watchContractEvent(wagmi.config, {
        address: contractAddress,
        eventName: "Claimed",
        abi: iAllowanceAbi,
        chainId: chainId as 1 | 11155111 | 8453,
        async onLogs(events) {
          const client = clientForChain(chainId);
          logger.info(
            {
              events: events.map((e) => ({
                claimedAddress: e.args._address,
                chainId,
                claims: e.args._claims,
              })),
            },
            "Received events",
          );
          try {
            const observedClaims = collectionIds
              .map((collectionId) =>
                prepForStorage({
                  events,
                  observable: {
                    contractAddress,
                    chainId,
                    startBlockHeight,
                    collectionId,
                  },
                }),
              )
              .flat();
            await updateStorage({
              contractAddress,
              chainId,
              claimsDao,
              observedClaims,
              // allow for reorgs
              fromBlockHeight:
                observedClaims.length === 0
                  ? Number(await client.getBlockNumber()) - 6
                  : undefined,
            });
          } catch (err) {
            logger.error(err, "Failed to update storage with events");
          }
        },
      });
    },
  );
  await catchUp({
    observables,
    claimsDao,
    collectionIds,
  });
  process.on("SIGINT", () => {
    watches.forEach((watch) => {
      watch();
    });
  });
  return watches;
}
