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
  delay,
  filter,
  map,
  concatMap,
  EMPTY,
} from "rxjs";
import { IFundingDao } from "../dao/funding.js";
import { MempoolClient, createLogger } from "../index.js";
import { BitcoinNetworkNames, ID_Collection } from "@0xflick/ordinals-models";
import { Address } from "@0xflick/tapscript";
import { NoVoutFound, enqueueCheckTxo } from "./mempool.js";

const logger = createLogger({ name: "watch/funding" });

function customBackoff(retries: number) {
  if (retries < 10) return 3000;
  if (retries < 20) return 5 * 1000;
  if (retries < 30) return 60 * 1000;
  if (retries < 40) return 5 * 60 * 1000;
  if (retries < 50) return 10 * 60 * 1000;
  return 60 * 60 * 1000;
}

type TPollFunding = {
  address: string;
  id: string;
  lastChecked?: Date | undefined;
  timesChecked: number;
  fundingAmountSat: number;
};

export async function pollForFundings({
  fundings,
  fundingDao,
  mempoolBitcoinClient,
  pollInterval = 60000,
  network = "testnet",
}: {
  fundings: TPollFunding[];
  fundingDao: IFundingDao;
  mempoolBitcoinClient: MempoolClient["bitcoin"];
  pollInterval?: number;
  network?: BitcoinNetworkNames;
}) {}

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
    network = "testnet",
  }: {
    collectionId: ID_Collection;
    fundingDao: IFundingDao;
    mempoolBitcoinClient: MempoolClient["bitcoin"];
    pollInterval?: number;
    network?: BitcoinNetworkNames;
  },
  notify?: (funding: {
    txid: string;
    vout: number;
    amount: number;
    address: string;
    id: string;
    fundingAmountSat: number;
  }) => void,
) {
  logger.info(`Watching for fundings for collection ${collectionId}`);

  // Use a Subject as a notifier to cancel all ongoing observables when needed.
  const stop$ = new Subject();

  // 1. Periodically check for new fundings and add new fundings to the queue
  const pollForFundings$ = interval(pollInterval).pipe(
    startWith(0),
    takeUntil(stop$),
    tap(() => logger.trace(`Polling for new fundings`)),
    switchMap(() =>
      from(
        fundingDao.listAllFundingsByStatus({
          id: collectionId,
          fundingStatus: "funding",
        }),
      ),
    ),
    filter((funding) => {
      const n = Address.decode(funding.address).network;
      if (n === "main" && network === "mainnet") return true;
      if (n === network) return true;
      return false;
    }),
    tap((funding) => {
      logger.trace(
        `Starting to watch funding ${funding.id} for address ${funding.address} `,
      );
    }),
    mergeMap((funding) =>
      from([funding]).pipe(
        tap((funding) =>
          logger.trace(
            {
              timesChecked: funding.timesChecked,
            },
            `Enqueuing funding ${funding.id}`,
          ),
        ),
        mergeMap((funding) => {
          return from(
            enqueueCheckTxo({
              address: funding.address,
              mempoolBitcoinClient,
            }),
          ).pipe(
            map((mempoolResponse) => {
              if (!mempoolResponse)
                throw new NoVoutFound({ address: funding.address });
              return {
                ...funding,
                ...mempoolResponse,
              };
            }),

            // retry({
            //   resetOnSuccess: true,
            //   count: funding.timesChecked,
            //   delay(error, retryCount) {
            //     return timer(customBackoff(retryCount));
            //   },
            // }),
            mergeMap(async (funding) => {
              try {
                logger.info(
                  `Funding ${funding.id} for ${funding.address} found!  Paid ${funding.amount} for a request of: ${funding.fundingAmountSat}`,
                );
                if (funding.amount < funding.fundingAmountSat) {
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
                logger.error(
                  error,
                  "Error updating address funded for",
                  funding.address,
                );
              }
            }),
            catchError((error) => {
              if (error instanceof NoVoutFound) {
                // const now = new Date();
                // return from(
                //   fundingDao
                //     .updateFundingLastChecked({
                //       id: funding.id,
                //       lastChecked: now,
                //     })
                //     .catch((error) => {
                //       logger.error(
                //         error,
                //         "Error updating funding last checked",
                //       );
                //       throw error;
                //     })
                //     .then(() => {
                //       logger.trace(
                //         `Updated last checked for ${funding.address}`,
                //       );
                //       throw error;
                //     }),
                // );
                return EMPTY;
              }
              logger.error(
                error,
                "Error checking funding for",
                funding.address,
              );
              return EMPTY;
            }),
          );
        }, 12),
      ),
    ),
  );

  // When $fundings is complete and we have a vout value, we can update the funding with the new txid and vout
  // This assumes the checkFundings observable emits individual funding results.
  pollForFundings$.subscribe(async (funding) => {
    // logger.info({ funding }, "here");
    // if (!funding) {
    //   logger.error("No funding found!");
    //   return;
    // }
    // try {
    //   logger.info(
    //     `Funding ${funding.id} for ${funding.address} found!  Paid ${funding.fundedAmount} for a request of: ${funding.fundingAmountSat}`,
    //   );
    //   if (funding.fundedAmount < funding.fundingAmountSat) {
    //     logger.warn(
    //       `Funding ${funding.id} for ${funding.address} is underfunded`,
    //     );
    //   } else {
    //     await fundingDao.addressFunded({
    //       fundingTxid: funding.txid,
    //       fundingVout: funding.vout,
    //       id: funding.id,
    //     });
    //     await fundingDao.updateFundingLastChecked({
    //       id: funding.id,
    //       lastChecked: new Date(),
    //       resetTimesChecked: true,
    //     });
    //     notify?.(funding);
    //   }
    // } catch (error) {
    //   logger.error(error, "Error updating address funded for", funding.address);
    // }
  });

  return () => {
    stop$.next(void 0);
    stop$.complete();
  };
}
