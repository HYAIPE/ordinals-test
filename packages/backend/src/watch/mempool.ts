import Queue from "p-queue";
import { MempoolClient } from "../bitcoin/mempool.js";

const processingQueue = new Queue({ concurrency: 5 });

export class NoVoutFound extends Error {
  constructor({ address }: { address: string }) {
    super(`No vout found for address ${address}`);
  }
}

const checkTxo = async ({
  address,
  mempoolBitcoinClient,
}: {
  address: string;
  mempoolBitcoinClient: MempoolClient["bitcoin"];
}) => {
  const { txid, vout, amount } = await fetchFunding({
    address,
    mempoolBitcoinClient,
  });
  return {
    address,
    txid,
    vout,
    amount,
  };
};

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

export const enqueueCheckTxo = ({
  address,
  mempoolBitcoinClient,
}: {
  address: string;
  mempoolBitcoinClient: MempoolClient["bitcoin"];
}) => {
  return processingQueue.add(() => checkTxo({ address, mempoolBitcoinClient }));
};
