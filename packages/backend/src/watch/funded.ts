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
  map,
} from "rxjs";
import { SecretKey } from "@0xflick/crypto-utils";
import { IFundingDao, IFundingDocDao } from "../dao/funding.js";
import { MempoolClient, createLogger } from "../index.js";
import { ID_Collection } from "@0xflick/ordinals-models";
import { generateGenesisTransaction } from "@0xflick/inscriptions";
import { NoVoutFound, enqueueCheckTxo } from "./mempool.js";

const logger = createLogger({ name: "watch/genesis" });

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
export function watchForFunded(
  {
    collectionId,
    fundingDao,
    fundingDocDao,
    mempoolBitcoinClient,
    pollFundingsInterval = 60000,
  }: {
    collectionId: ID_Collection;
    fundingDao: IFundingDao;
    fundingDocDao: IFundingDocDao;
    mempoolBitcoinClient: MempoolClient["bitcoin"];
    pollFundingsInterval?: number;
  },
  notify?: (funded: {
    fundingTxid: string;
    genesisTxid: string;
    vout: number;
    amount: number;
    address: string;
    id: string;
  }) => void,
) {
  logger.info(`Watching for funded outputs for collection ${collectionId}`);

  // Use a Subject as a notifier to cancel all ongoing observables when needed.
  const stop$ = new Subject();

  // 1. Periodically check for new fundings and add new fundings to the queue
  const pollForFunded$ = interval(pollFundingsInterval).pipe(
    startWith(0),
    takeUntil(stop$),
    tap(() =>
      logger.trace(`Polling for new funded inscriptions to fund genesis`),
    ),
    switchMap(() =>
      from(
        fundingDao.listAllFundingsByStatus({
          id: collectionId,
          fundingStatus: "funded",
        }),
      ),
    ),
    tap((funded) => {
      logger.trace(
        `Starting to watch funded ${funded.id} for address ${funded.address} `,
      );
    }),
    switchMap((funded) =>
      from([funded]).pipe(
        tap((funding) =>
          logger.trace(`Enqueuing genesis funding ${funding.id}`),
        ),
        mergeMap((funded) => {
          return from(
            enqueueCheckTxo({ address: funded.address, mempoolBitcoinClient }),
          ).pipe(
            map((mempoolResponse) => {
              if (!mempoolResponse)
                throw new NoVoutFound({ address: funded.address });
              return {
                ...funded,
                ...mempoolResponse,
              };
            }),
            catchError((error) => {
              logger.error(error, "Error checking funding for", funded.address);
              if (error instanceof NoVoutFound) {
                logger.info(
                  `No payment found for ${funded.address} so submitting payment on behalf of ${funded.id}}`,
                );
                // const now = new Date();
                return from(
                  Promise.resolve().then(async () => {
                    // try {
                    //   fundingDao.updateFundingLastChecked({
                    //     id: funded.id,
                    //     lastChecked: now,
                    //   });
                    // } catch (error) {
                    //   logger.error(
                    //     error,
                    //     "Error updating funding last checked",
                    //   );
                    //   throw error;
                    // }
                    // logger.trace(`Updated last checked for ${funded.id}`);
                    throw error;
                  }),
                );
              }
              logger.error(error, "Error checking funding for", funded.address);
              throw error;
            }),
            retry({
              resetOnSuccess: true,
              count: funded.timesChecked,
              delay(error, retryCount) {
                return timer(customBackoff(retryCount));
              },
            }),
            mergeMap(async (funded) => {
              if (!funded) {
                logger.error("No funding found!");
                throw new Error("No funding found!");
              }
              try {
                const [fundedDb, doc] = await Promise.all([
                  fundingDao.getFunding(funded.id),
                  fundingDocDao.getInscriptionTransaction({
                    id: funded.id,
                    fundingAddress: funded.address,
                  }),
                ]);
                if (
                  typeof fundedDb.fundingTxid === "undefined" ||
                  typeof fundedDb.fundingVout === "undefined"
                ) {
                  logger.error(
                    {
                      fundedDb,
                    },
                    "No funding txid or vout found for",
                    funded.id,
                  );
                  throw new Error(
                    `No funding txid or vout found for ${funded.id}`,
                  );
                }
                logger.info("Generating genesis transaction");
                const secKey = new SecretKey(Buffer.from(doc.secKey, "hex"));
                try {
                  const genesisTx = await generateGenesisTransaction({
                    amount: funded.amount,
                    initCBlock: doc.initCBlock,
                    initLeaf: doc.initLeaf,
                    initScript: doc.initScript,
                    initTapKey: doc.initTapKey,
                    inscriptions: doc.writableInscriptions,
                    padding: doc.padding,
                    secKey,
                    txid: funded.txid,
                    vout: funded.vout,
                    tip: doc.tip,
                    tippingAddress: fundedDb.tipAmountDestination,
                  });

                  try {
                    logger.info(
                      `Sending genesis funding ${funded.id} to mempool`,
                    );
                    const genesisTxid =
                      (await mempoolBitcoinClient.transactions.postTx({
                        txhex: genesisTx,
                      })) as string;

                    try {
                      logger.info(`Genesis funding ${funded.id} is funded!`);

                      await fundingDao.genesisFunded({
                        genesisTxid,
                        id: funded.id,
                      });
                      await fundingDao.updateFundingLastChecked({
                        id: funded.id,
                        lastChecked: new Date(),
                        resetTimesChecked: true,
                      });
                      notify?.({
                        ...funded,
                        genesisTxid,
                        fundingTxid: funded.txid,
                      });
                      return {
                        ...funded,
                        genesisTxid,
                        fundingTxid: funded.txid,
                      };
                    } catch (error) {
                      logger.error(
                        error,
                        "Error updating address funded for",
                        funded.address,
                      );
                      throw error;
                    }
                  } catch (error) {
                    logger.error(
                      error,
                      "Error sending transaction for",
                      funded.address,
                    );
                    throw error;
                  }
                } catch (error) {
                  logger.error(
                    error,
                    "Error generating transaction",
                    funded.address,
                  );
                  throw error;
                }
              } catch (error) {
                logger.error(
                  error,
                  "Error getting funding for",
                  funded.address,
                );
                throw error;
              }
            }),
          );
        }),
      ),
    ),
    delay(5000),
  );

  // When $fundings is complete and we have a vout value, we can update the funding with the new txid and vout
  // This assumes the checkFundings observable emits individual funding results.
  pollForFunded$.subscribe(async ({ id }) => {
    logger.trace(`Genesis funding ${id} is funded!`);
  });

  return () => {
    stop$.next(void 0);
    stop$.complete();
  };
}
