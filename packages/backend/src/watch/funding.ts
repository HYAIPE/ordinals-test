import {
  Subject,
  catchError,
  from,
  interval,
  mergeMap,
  retry,
  switchMap,
  takeUntil,
  tap,
  startWith,
  timer,
} from "rxjs";
import Queue from "p-queue";
import { IFundingDao } from "../dao/funding.js";
import { MempoolClient, createLogger } from "../index.js";
import { ID_Collection } from "@0xflick/ordinals-models";
import { bitcoinToSats } from "@0xflick/inscriptions";

const logger = createLogger({ name: "watch/funding" });
// Queue to process fundings
const processingQueue = new Queue({ concurrency: 5 });

class NoVoutFound extends Error {
  constructor({ address }: { address: string }) {
    super(`No vout found for address ${address}`);
  }
}

async function fetchFunding({
  address,
  mempoolBitcoinClient,
}: {
  address: string;
  mempoolBitcoinClient: MempoolClient["bitcoin"];
}) {
  const txs = await mempoolBitcoinClient.addresses.getAddressTxs({ address });
  for (const tx of txs) {
    for (let i = 0; i < tx.vout.length; i++) {
      const output = tx.vout[i];
      if (output.scriptpubkey_address === address) {
        return {
          txid: tx.txid,
          vout: i,
          amount: output.value,
        };
      }
    }
  }
  throw new NoVoutFound({ address });
}

function customBackoff(retries: number) {
  if (retries < 10) return 3000;
  if (retries < 20) return 5 * 1000;
  if (retries < 30) return 60 * 1000;
  if (retries < 40) return 5 * 60 * 1000;
  if (retries < 50) return 10 * 60 * 1000;
  return 60 * 60 * 1000;
}

/*
 * Periodically fetches all fundings that we are waiting for the user to fund
 * using the "lastChecked" and "timeChecked" field, we implement a backoff stategy to avoid
 * needing to endlessly check stale fundings.
 *
 * Not currently expiring fundings, but we could do that in the future.
 *
 */
export function watchForFundings(
  {
    collectionId,
    fundingDao,
    mempoolBitcoinClient,
    pollInterval = 60000,
  }: {
    collectionId: ID_Collection;
    fundingDao: IFundingDao;
    mempoolBitcoinClient: MempoolClient["bitcoin"];
    pollInterval?: number;
  },
  notify?: (funding: {
    txid: string;
    vout: number;
    fundedAmount: number;
    address: string;
    id: string;
    fundingAmountSat: number;
  }) => void,
) {
  logger.info(`Watching for fundings for collection ${collectionId}`);
  const enqueueFunding = (funding: {
    address: string;
    id: string;
    fundingAmountSat: number;
  }) => {
    return processingQueue.add(() => checkFunding(funding));
  };
  const checkFunding = async (funding: {
    address: string;
    id: string;
    fundingAmountSat: number;
  }) => {
    const { address } = funding;
    const { txid, vout, amount } = await fetchFunding({
      address,
      mempoolBitcoinClient,
    });
    return {
      ...funding,
      txid,
      vout,
      fundedAmount: amount,
    };
  };

  // Use a Subject as a notifier to cancel all ongoing observables when needed.
  const stop$ = new Subject();

  // 1. Periodically check for new fundings and add new fundings to the queue
  const pollForFundings$ = interval(pollInterval).pipe(
    startWith(0),
    takeUntil(stop$),
    tap(() => logger.info(`Polling for new fundings`)),
    switchMap(() =>
      from(
        fundingDao.listAllFundingsByStatus({
          id: collectionId,
          fundingStatus: "funding",
        }),
      ),
    ),
    tap((funding) => {
      logger.info(
        `Starting to watch funding ${funding.id} for address ${funding.address} `,
      );
    }),
    mergeMap((funding) =>
      from([funding]).pipe(
        tap((funding) =>
          logger.info(
            {
              timesChecked: funding.timesChecked,
            },
            `Enqueuing funding ${funding.id}`,
          ),
        ),
        mergeMap((funding) => {
          return from(enqueueFunding(funding)).pipe(
            catchError((error) => {
              if (error instanceof NoVoutFound) {
                logger.info(`No vout found for ${funding.address}`);
                const now = new Date();
                return from(
                  fundingDao
                    .updateFundingLastChecked({
                      id: funding.id,
                      lastChecked: now,
                    })
                    .catch((error) => {
                      logger.error(
                        error,
                        "Error updating funding last checked",
                      );
                      throw error;
                    })
                    .then(() => {
                      logger.info(
                        `Updated last checked for ${funding.address}`,
                      );
                      throw error;
                    }),
                );
              }
              logger.error(
                error,
                "Error checking funding for",
                funding.address,
              );
              throw error;
            }),
            retry({
              resetOnSuccess: true,
              count: funding.timesChecked,
              delay(error, retryCount) {
                return timer(customBackoff(retryCount));
              },
            }),
          );
        }),
      ),
    ),
  );

  // When $fundings is complete and we have a vout value, we can update the funding with the new txid and vout
  // This assumes the checkFundings observable emits individual funding results.
  pollForFundings$.subscribe(async (funding) => {
    logger.info({ funding }, "Funding result");
    if (!funding) {
      logger.error("No funding found!");
      return;
    }
    try {
      logger.info(
        `Funding ${funding.id} for ${funding.address} found!  Paid ${funding.fundedAmount} for a request of: ${funding.fundingAmountSat}`,
      );
      if (funding.fundedAmount < funding.fundingAmountSat) {
        logger.warn(
          `Funding ${funding.id} for ${funding.address} is underfunded`,
        );
      } else {
        await fundingDao.addressFunded({
          fundingTxid: funding.txid,
          fundingVout: funding.vout,
          id: funding.id,
        });
        await fundingDao.updateFundingLastChecked({
          id: funding.id,
          lastChecked: new Date(),
          resetTimesChecked: true,
        });
        notify?.(funding);
      }
    } catch (error) {
      logger.error(error, "Error updating address funded for", funding.address);
    }
  });

  return () => {
    processingQueue.clear();
    stop$.next(void 0);
    stop$.complete();
  };
}
