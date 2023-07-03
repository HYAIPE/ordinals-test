import { RPCClient } from "rpc-bitcoin";
import { v4 as uuidv4 } from "uuid";
import {
  bitcoinToSats,
  generateFundingAddress,
  generatePrivKey,
  generateRefundTransaction,
  satsToBitcoin,
} from "@0xflick/inscriptions";
import { inspect } from "util";
import { Tx } from "@cmdcode/tapscript";

const bitcoinClient = new RPCClient({
  url: "http://127.0.0.1",
  port: 18443,
  timeout: 10000,
  user: "test",
  pass: "test",
});

async function createwallet(wallet: string) {
  try {
    await bitcoinClient.createwallet({
      wallet_name: wallet,
    });
  } catch (e) {
    // ignore
  }
}
async function loadWallet(wallet: string) {
  try {
    await bitcoinClient.loadwallet({
      filename: wallet,
    });
  } catch (e) {
    // ignore
  }
}

const miningWallet = uuidv4();
const fundingWallet = "default";
const testWallet = uuidv4();
const refundWallet = uuidv4();

try {
  for (const wallet of [
    miningWallet,
    fundingWallet,
    refundWallet,
    testWallet,
  ]) {
    await createwallet(wallet);
    await loadWallet(wallet);
  }

  // mining address
  const miningAddress = await bitcoinClient.getnewaddress(
    {
      address_type: "bech32",
    },
    miningWallet
  );

  // new address
  const newAddress = await bitcoinClient.getnewaddress(
    {
      address_type: "bech32m" as any,
    },
    testWallet
  );
  const refundAddress = await bitcoinClient.getnewaddress(
    {
      address_type: "bech32m" as any,
    },
    refundWallet
  );

  // mine block
  await bitcoinClient.generatetoaddress(
    {
      nblocks: 1,
      address: miningAddress,
    },
    miningWallet
  );

  const privKey =
    "0850a89722bbdd7eb41f55a6076b8721ccc2b15cd4a12d4e3df48fcff4cfb707";

  // get funding address
  const { fundingAddress, totalFee, initCBlock, secKey, initTapKey, amount } =
    await generateFundingAddress({
      address: newAddress,
      feeRate: 1,
      inscriptions: [
        {
          content: Buffer.from("test", "utf8"),
          mimeType: "text/plain",
        },
      ],
      network: "regtest",
      tip: 0,
      privKey,
      padding: 10000,
    });

  // send to funding address
  console.log(`Sending ${amount}`);
  const txResponse = await bitcoinClient.send(
    {
      outputs: {
        [fundingAddress]: Number(satsToBitcoin(BigInt(totalFee))),
      },
      options: {
        locktime: 0,
      },
    },
    fundingWallet
  );
  const txid = txResponse.txid;

  // get tx
  const txHex = await bitcoinClient.getrawtransaction({
    txid,
    verbose: false,
  });

  console.log("Sent!");

  const tx = Tx.decode(txHex);

  // mine block
  await bitcoinClient.generatetoaddress(
    {
      nblocks: 1,
      address: miningAddress,
    },
    miningWallet
  );

  // Find the vout with the amount === value
  const amountInt = BigInt(totalFee);

  const vout = tx.vout.findIndex((v) => BigInt(v.value) === amountInt);
  if (vout === -1) {
    throw new Error("Could not find vout");
  }

  const refundTxHex = await generateRefundTransaction({
    address: refundAddress,
    feeRate: 2,
    amount: tx.vout[vout].value,
    initTapKey,
    refundCBlock: initCBlock,
    secKey,
    txid,
    vout,
  });

  // broadcast refund tx
  console.log("Broadcasting refund tx");
  const refundTxId = await bitcoinClient.sendrawtransaction({
    hexstring: refundTxHex,
  });

  // mine block
  await bitcoinClient.generatetoaddress(
    {
      nblocks: 1,
      address: miningAddress,
    },
    miningWallet
  );
  console.log("Mined block");

  // get balance of newAddress
  const balance = await bitcoinClient.getbalance({}, refundWallet);
  console.log(JSON.stringify(balance, null, 2));
} catch (e) {
  console.error(e);
}
