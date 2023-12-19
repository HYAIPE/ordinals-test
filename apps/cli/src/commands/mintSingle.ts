import {
  addressReceivedMoneyInThisTx,
  generateFundingAddress,
  generateGenesisTransaction,
  generatePrivKey,
  broadcastTx,
  generateRevealTransaction,
  BitcoinNetworkNames,
  waitForInscriptionFunding,
} from "@0xflick/inscriptions";
import { lookup } from "mime-types";
import fs from "fs";
import { sendBitcoin } from "../bitcoin.js";

export async function mintSingle({
  address,
  network,
  file,
  mimeType,
  feeRate,
  rpcuser,
  rpcpassword,
  rpcwallet,
  noSend,
}: {
  address: string;
  file: string;
  mimeType?: string;
  network: BitcoinNetworkNames;
  feeRate: number;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
  noSend: boolean;
}) {
  const content = await fs.promises.readFile(file);

  const privKey = generatePrivKey();
  console.log(`privKey: ${privKey}`);
  const response = await generateFundingAddress({
    address,
    inscriptions: [
      {
        content,
        mimeType: (mimeType ?? lookup(file)) || "application/octet-stream",
      },
    ],
    padding: 546,
    tip: 0,
    network,
    privKey,
    feeRate,
  });
  console.log(`Pay ${response.amount} to ${response.fundingAddress}`);
  let funded: readonly [string, number, number] | readonly [null, null, null] =
    [null, null, null];
  if (!noSend) {
    await sendBitcoin({
      fee_rate: feeRate,
      network,
      outputs: [[response.fundingAddress, response.amount]],
      rpcpassword,
      rpcuser,
      rpcwallet,
    });
  }
  console.log("Waiting for funding...");
  do {
    funded = await addressReceivedMoneyInThisTx(
      response.fundingAddress,
      network
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (funded[0] == null);
  console.log(`Funded!`);
  let [txid, vout, amount] = funded;
  const genesisTx = await generateGenesisTransaction({
    amount,
    initCBlock: response.initCBlock,
    initLeaf: response.initLeaf,
    initScript: response.initScript,
    initTapKey: response.initTapKey,
    inscriptions: response.inscriptionsToWrite,
    padding: response.padding,
    secKey: response.secKey,
    txid,
    vout,
  });
  console.log(`Genesis tx: ${genesisTx}`);
  const genesisTxId = await broadcastTx(genesisTx, network);
  console.log(`Genesis tx id: ${genesisTxId}`);

  funded = [null, null, null];
  console.log("Waiting for inscription...");
  do {
    funded = await addressReceivedMoneyInThisTx(
      response.inscriptionsToWrite[0].inscriptionAddress,
      network
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (funded[0] == null);
  console.log(`Revealing....`);

  for (let i = 0; i < response.inscriptionsToWrite.length; i++) {
    const inscription = response.inscriptionsToWrite[i];

    const [txid, vout, amount] = await waitForInscriptionFunding(
      inscription,
      network
    );

    const revealTx = await generateRevealTransaction({
      amount,
      inscription,
      address,
      secKey: response.secKey,
      txid,
      vout,
    });
    // console.log(`Reveal tx: ${revealTx}`);
    const revealTxId = await broadcastTx(revealTx, network);
    console.log(`Reveal tx id: ${revealTxId}`);
  }
}
