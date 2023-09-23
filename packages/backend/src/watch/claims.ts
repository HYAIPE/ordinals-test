import { IObservedClaim } from "@0xflick/ordinals-models";
import Bottleneck from "bottleneck";
import { createLogger } from "@0xflick/ordinals-backend";
import { Address } from "@0xflick/tapscript";
import { Log } from "viem";
import { watchIAllowanceEvent, iAllowanceABI } from "../wagmi/generated.js";
import { ClaimsDao } from "../index.js";
import { clientForChain } from "./viem.js";

const logger = createLogger({
  name: "watchClaimedEvents",
});
const claimEventAbi = iAllowanceABI[0];
type ClaimedEvent = typeof claimEventAbi;
type ClaimedEventLog = Log<bigint, number, ClaimedEvent, undefined>;

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
  contractAddress,
  chainId,
  claimsDao,
  observedBlockHeight,
}: {
  contractAddress: `0x${string}`;
  chainId: number;
  claimsDao: ClaimsDao;
  observedBlockHeight: number;
}) => {
  logger.info(
    { contractAddress, chainId, observedBlockHeight },
    "fetching logs in chunks"
  );
  const client = clientForChain(chainId);
  let currentStartBlock = observedBlockHeight;
  const currentBlockHeight = Number(await client.getBlockNumber());
  while (currentStartBlock < currentBlockHeight) {
    const endBlock = Math.min(
      currentStartBlock + GET_LOG_BLOCK_REQUEST_SIZE,
      currentBlockHeight
    );
    logger.info(
      `catching up on ${contractAddress}#${chainId} from ${currentStartBlock} to ${endBlock}`
    );
    const logs = await client.getLogs({
      fromBlock: BigInt(currentStartBlock),
      toBlock: BigInt(endBlock),
      address: contractAddress,
      event: claimEventAbi,
    });

    const claims = prepForStorage({
      events: logs,
      observable: {
        contractAddress,
        chainId,
        startBlockHeight: observedBlockHeight,
      },
    });
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
}: {
  observables: IObservableContract[];
  claimsDao: ClaimsDao;
}) {
  // organize the observables by `${contractAddress}#${chainId}` and max block height
  // for each of them, get all events from the last block height to the current block height
  const info: {
    contractAddress: `0x${string}`;
    chainId: number;
    observedBlockHeight: number;
  }[] = await claimsDao.batchGetLastObservedBlockHeight({
    observedContracts: observables,
  });

  logger.info(`Found ${info.length} observables in the database.`);

  // because not every contract necessarily exists in the database, we need to
  // add back in entries for contracts that have never been queried before.
  //
  // for these we will use an observedBlockHeight of 0, which will cause us to
  // query all events from genesis to now.

  const missing = observables.filter(
    (observable) =>
      !info.find(
        (entry) =>
          entry.contractAddress === observable.contractAddress &&
          entry.chainId === observable.chainId
      )
  );

  if (missing.length > 0) {
    logger.info(
      `Found ${missing.length} observables that have never been queried before.`
    );
  }

  for (const observable of missing) {
    info.push({
      contractAddress: observable.contractAddress as `0x${string}`,
      chainId: observable.chainId,
      observedBlockHeight: observable.startBlockHeight,
    });
  }

  const rateLimitedFetchLogsInChunks = limiter.wrap(fetchLogsInChunks);

  await Promise.all(
    info.map(async (contractInfo) => {
      await rateLimitedFetchLogsInChunks({
        ...contractInfo,
        claimsDao,
      });
    })
  );
}

function prepForStorage({
  events,
  observable,
}: {
  events: ClaimedEventLog[];
  observable: IObservableContract;
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
        });
      }
      currentIndex++;
    }

    return memo.concat(validClaims);
  }, [] as IObservedClaim[]);

  return observedClaims;
}

export async function updateStorage({
  contractAddress,
  chainId,
  claimsDao,
  fromBlockHeight,
  observedClaims,
}: {
  contractAddress: `0x${string}`;
  chainId: number;
  claimsDao: ClaimsDao;
  fromBlockHeight?: number;
  observedClaims: IObservedClaim[];
}) {
  if (observedClaims.length === 0) {
    await claimsDao.updateLastObserved({
      contractAddress: contractAddress,
      chainId: chainId,
      observedBlockHeight: fromBlockHeight ?? 0,
    });
  } else {
    await claimsDao.batchUpdateObservedClaims({
      observedClaims,
    });
  }
}

export async function watchForAllowance({
  observables,
  claimsDao,
}: {
  observables: IObservableContract[];
  claimsDao: ClaimsDao;
}) {
  const watches = observables.map(
    ({ chainId, contractAddress, startBlockHeight }) => {
      return watchIAllowanceEvent(
        {
          address: contractAddress,
          chainId: chainId,
          eventName: "Claimed",
        },
        async (events) => {
          const client = clientForChain(chainId);
          logger.info(
            {
              events: events.map((e) => ({
                claimedAddress: e.args._address,
                chainId,
                claims: e.args._claims,
              })),
            },
            "Received events"
          );
          try {
            const observedClaims = prepForStorage({
              events,
              observable: {
                chainId,
                contractAddress,
                startBlockHeight,
              },
            });
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
        }
      );
    }
  );
  await catchUp({
    observables,
    claimsDao,
  });
  process.on("SIGINT", () => {
    watches.forEach((watch) => {
      watch();
    });
  });
}
