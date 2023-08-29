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
import { SecretKey } from "@0xflick/crypto-utils";
import Queue from "p-queue";
import { IFundingDao, IFundingDocDao } from "../dao/funding.js";
import { MempoolClient, createLogger } from "../index.js";
import { ID_Collection } from "@0xflick/ordinals-models";
import { generateGenesisTransaction } from "@0xflick/inscriptions";

const logger = createLogger({ name: "watch/genesis" });
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
export function watchForFunded({
  collectionId,
  fundingDao,
  fundingDocDao,
  mempoolBitcoinClient,
}: {
  collectionId: ID_Collection;
  fundingDao: IFundingDao;
  fundingDocDao: IFundingDocDao;
  mempoolBitcoinClient: MempoolClient["bitcoin"];
}) {
  logger.info(`Watching for funded outputs for collection ${collectionId}`);
  const enqueueGenesisFunded = (funding: { address: string; id: string }) => {
    return processingQueue.add(() => checkFunded(funding));
  };
  const checkFunded = async (funding: { address: string; id: string }) => {
    const { address } = funding;
    const { txid, vout, amount } = await fetchFunding({
      address,
      mempoolBitcoinClient,
    });
    return {
      ...funding,
      txid,
      vout,
      amount,
    };
  };

  // Use a Subject as a notifier to cancel all ongoing observables when needed.
  const stop$ = new Subject();

  // 1. Periodically check for new fundings and add new fundings to the queue
  const pollForFunded$ = interval(60000 /* e.g., every 60 seconds */).pipe(
    startWith(0),
    takeUntil(stop$),
    tap(() =>
      logger.info(`Polling for new funded inscriptions to fund genesis`)
    ),
    switchMap(() =>
      from(
        fundingDao.listAllFundingsByStatus({
          id: collectionId,
          fundingStatus: "funded",
        })
      )
    ),
    tap((funded) => {
      logger.info(
        `Starting to watch funded ${funded.id} for address ${funded.address} `
      );
    }),
    switchMap((funded) =>
      from([funded]).pipe(
        tap((funding) => logger.info(`Enqueuing funding ${funding.id}`)),
        mergeMap((funded) => {
          return from(enqueueGenesisFunded(funded)).pipe(
            catchError((error) => {
              if (error instanceof NoVoutFound) {
                logger.info(
                  `No payment found for ${funded.address} so submitting payment on behalf of ${funded.id}}`
                );
                const now = new Date();
                return from(
                  Promise.resolve().then(async () => {
                    try {
                      fundingDao.updateFundingLastChecked({
                        id: funded.id,
                        lastChecked: now,
                      });
                    } catch (error) {
                      logger.error(
                        error,
                        "Error updating funding last checked"
                      );
                      throw error;
                    }
                    logger.info(`Updated last checked for ${funded.id}`);
                    throw error;
                  })
                );
              }
              logger.error(error, "Error checking funding for", funded.address);
              throw error;
            }),
            retry({
              delay(error, retryCount) {
                return timer(customBackoff(retryCount + funded.timesChecked));
              },
            })
          );
        })
      )
    )
  );

  // When $fundings is complete and we have a vout value, we can update the funding with the new txid and vout
  // This assumes the checkFundings observable emits individual funding results.
  pollForFunded$.subscribe(async (funded) => {
    if (!funded) {
      logger.error("No funding found!");
      return;
    }
    try {
      const [fundedDb, doc] = await Promise.all([
        fundingDao.getFunding(funded.id),
        fundingDocDao.getInscriptionTransaction({
          id: funded.id,
          fundingAddress: funded.address,
        }),
      ]);
      if (!fundedDb.fundingTxid || !fundedDb.fundingVout) {
        throw new Error(`No funding txid or vout found for ${funded.id}`);
      }

      await generateGenesisTransaction({
        amount: fundedDb.fundingAmountSat,
        initCBlock: doc.initCBlock,
        initLeaf: doc.initLeaf,
        initScript: doc.initScript,
        initTapKey: doc.initTapKey,
        inscriptions: doc.writableInscriptions,
        padding: doc.padding,
        secKey: new SecretKey(Buffer.from(doc.secKey, "hex")),
        txid: fundedDb.fundingTxid,
        vout: fundedDb.fundingVout,
        tip: doc.tip,
        // add tip here
        // tippingAddress
      });

      logger.info(`Genesis funding ${funded.id} is funded!`);
      await fundingDao.genesisFunded({
        genesisTxid: funded.txid,
        id: funded.id,
      });
      await fundingDao.updateFundingLastChecked({
        id: funded.id,
        lastChecked: new Date(),
        resetTimesChecked: true,
      });
    } catch (error) {
      logger.error(error, "Error updating address funded for", funded.address);
    }
  });

  return () => {
    processingQueue.clear();
    stop$.next(void 0);
    stop$.complete();
  };
}
