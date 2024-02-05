import {
  addressReceivedMoneyInThisTx,
  generateFundingAddress,
  generateGenesisTransaction,
  generatePrivKey,
  broadcastTx,
  BitcoinNetworkNames,
  waitForInscriptionFunding,
  generateRevealTransactionData,
  networkNamesToTapScriptName,
} from "@0xflick/inscriptions";
import { lookup } from "mime-types";
import fs from "fs";
import { Address, Tx, Tap } from "@0xflick/tapscript";
import { SecretKey, KeyPair } from "@0xflick/crypto-utils";
import { sendBitcoin } from "../bitcoin.js";
import { createMempoolBitcoinClient } from "../mempool.js";

export async function mintChild({
  address,
  network,
  file,
  mimeType,
  feeRate,
  rpcuser,
  rpcpassword,
  rpcwallet,
  noSend,
  metadataFile,
  compress,
  padding = 546,
  parentInscription,
  destinationParentAddress,
  parentTxid,
  parentIndex,
  parentSecKey,
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
  metadataFile?: string;
  compress?: boolean;
  padding?: number;
  parentInscription: string;
  parentTxid: string;
  parentIndex: number;
  parentSecKey: string;
  destinationParentAddress: string;
}) {
  if (destinationParentAddress === "auto") {
    const privKey = generatePrivKey();
    const secKey = new KeyPair(privKey);
    const pubkey = secKey.pub.x;
    const [tseckey] = Tap.getSecKey(secKey);
    const [tpubkey, cblock] = Tap.getPubKey(pubkey);
    const address = Address.p2tr.encode(
      tpubkey,
      networkNamesToTapScriptName(network),
    );

    console.log(`privKey: ${privKey}`);
    console.log(`address: ${address}`);
    console.log(`tseckey: ${tseckey}`);
    console.log(`tpubkey: ${tpubkey}`);
    console.log(`cblock: ${cblock}`);
    destinationParentAddress = address;
  }
  const content = await fs.promises.readFile(file);
  const metadata = metadataFile
    ? await fs.promises.readFile(metadataFile, "utf8")
    : undefined;

  const privKey = generatePrivKey();
  const [pTxid, pIndex] = parentInscription.split("i");
  const response = await generateFundingAddress({
    address,
    inscriptions: [
      {
        content,
        mimeType: (mimeType ?? lookup(file)) || "application/octet-stream",
        ...(metadata ? { metadata: JSON.parse(metadata) } : {}),
        compress,
      },
    ],
    padding,
    tip: 0,
    network,
    privKey,
    feeRate,
    parentInscriptions: [{ txid: pTxid, index: Number(pIndex) }],
  });
  const mempoolClient = createMempoolBitcoinClient({
    network,
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
      network,
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
      network,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (funded[0] == null);
  console.log(`Revealing....`);

  for (let i = 0; i < response.inscriptionsToWrite.length; i++) {
    const inscription = response.inscriptionsToWrite[i];

    const [txid, vout, amount] = await waitForInscriptionFunding(
      inscription,
      network,
    );
    const r = await mempoolClient.transactions.getTx({
      txid: parentTxid,
    });
    const { vout: parentVout } = r;
    const voutAmount = parentVout[parentIndex].value;
    const destinationParentAddressScript = Address.decode(
      destinationParentAddress,
    ).script;

    const revealTxData = generateRevealTransactionData({
      amount,
      inscription,
      address,
      secKey: response.secKey,
      txid,
      vout,
      parentTxs: [
        {
          parentVout: {
            value: voutAmount,
            scriptPubKey: destinationParentAddressScript,
          },
          secKey: new SecretKey(Buffer.from(parentSecKey, "hex")),
          txid: parentTxid,
          value: voutAmount,
          vout: parentIndex,
        },
      ],
    });
    // console.log(`Reveal tx: ${Tx.encode(revealTxData).hex}`);
    const revealTxId = await broadcastTx(Tx.encode(revealTxData).hex, network);
    console.log(`Reveal tx id: ${revealTxId}`);
  }
}
