import {
  Subject,
  from,
  interval,
  mergeMap,
  retry,
  switchMap,
  takeUntil,
  tap,
  startWith,
  timer,
  map,
} from "rxjs";
import { SecretKey } from "@0xflick/crypto-utils";
import Queue from "p-queue";
import { IFundingDao, IFundingDocDao } from "../dao/funding.js";
import { MempoolClient, createLogger } from "../index.js";
import { ID_Collection } from "@0xflick/ordinals-models";
import { generateRevealTransaction } from "@0xflick/inscriptions";

const logger = createLogger({ name: "watch/funded" });
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
export function watchForGenesis({
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
  logger.info(`Watching for funded genesis for collection ${collectionId}`);
  const enqueueGenesisFunded = (funding: { address: string }) => {
    return processingQueue.add(() => checkGenesis(funding));
  };
  const checkGenesis = async (funding: { address: string }) => {
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
  const pollForGenesisFunded$ = interval(
    60000 /* e.g., every 60 seconds */
  ).pipe(
    startWith(0),
    takeUntil(stop$),
    tap(() =>
      logger.info(`Polling for new funded inscriptions to fund genesis`)
    ),
    switchMap(() =>
      from(
        fundingDao.listAllFundingsByStatus({
          id: collectionId,
          fundingStatus: "genesis",
        })
      )
    ),
    tap((funded) => {
      logger.info(
        `Starting to watch funded ${funded.id} for address ${funded.address} `
      );
    }),
    tap((funding) => logger.info(`Enqueuing funding ${funding.id}`)),
    mergeMap((funded) => {
      return from(
        Promise.all([
          fundingDao.getFunding(funded.id),
          fundingDocDao.getInscriptionTransaction({
            id: funded.id,
            fundingAddress: funded.address,
          }),
        ]).then(async ([funded, doc]) => {
          return doc.writableInscriptions.map((inscription) => ({
            inscription,
            funded,
            doc,
          }));
        })
      );
    }),
    switchMap((inscriptions) =>
      from(inscriptions).pipe(
        mergeMap(({ inscription, funded, doc }) =>
          from(
            enqueueGenesisFunded({
              address: inscription.inscriptionAddress,
            })
          ).pipe(
            retry({
              delay(error, retryCount) {
                return timer(customBackoff(retryCount + funded.timesChecked));
              },
            }),
            map((mempoolResponse) => {
              if (!mempoolResponse) {
                throw new Error("No mempool response");
              }
              return {
                inscription,
                funded,
                doc,
                mempoolResponse,
              };
            })
          )
        )
      )
    ),
    tap((funding) =>
      logger.info(`Revealing ${funding.inscription.inscriptionAddress}`)
    ),
    mergeMap(({ inscription, funded, mempoolResponse }) => {
      const { txid, vout, amount } = mempoolResponse;
      return from(
        generateRevealTransaction({
          address: inscription.inscriptionAddress,
          amount,
          inscription,
          secKey: new SecretKey(Buffer.from(funded.secretKey, "hex")),
          txid,
          vout,
        })
      ).pipe(
        mergeMap((genesisTx) => {
          return from(
            mempoolBitcoinClient.transactions.postTx({
              txhex: genesisTx,
            }) as Promise<string>
          ).pipe(
            tap((txid) => {
              logger.info(`Genesis transaction ${txid} sent`);
            })
          );
        }),
        mergeMap(
          async (txid) =>
            await fundingDao.revealFunded({
              id: funded.id,
              revealTxid: txid,
            })
        )
      );
    })
  );
  // When $fundings is complete and we have a vout value, we can update the funding with the new txid and vout
  // This assumes the checkFundings observable emits individual funding results.
  pollForGenesisFunded$.subscribe();

  return () => {
    processingQueue.clear();
    stop$.next(void 0);
    stop$.complete();
  };
}
