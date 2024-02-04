import fs from "fs";
import { globIterate } from "glob";
import { lookup } from "mime-types";
import {
  addressReceivedMoneyInThisTx,
  generateFundingAddress,
  generateGenesisTransaction,
  generatePrivKey,
  broadcastTx,
  generateRevealTransaction,
  BitcoinNetworkNames,
  waitForInscriptionFunding,
  InscriptionContent,
  loopTilAddressReceivesMoney,
} from "@0xflick/inscriptions";

export async function bulkMint({
  address,
  network,
  globStr,
  outputFile,
  privKey,
  feeRate,
}: {
  address: string;
  network: BitcoinNetworkNames;
  globStr: string;
  outputFile: string;
  privKey?: string;
  feeRate: number;
}) {
  privKey = privKey ?? generatePrivKey();
  console.log(`privKey: ${privKey}`);
  const inscriptions: (InscriptionContent & {
    path: string;
  })[] = [];
  for await (const path of globIterate(globStr)) {
    const content = await fs.promises.readFile(path);
    const mimeType = lookup(path) || "application/octet-stream";
    inscriptions.push({
      content,
      mimeType,
      path,
    });
  }

  console.log(`Found ${inscriptions.length} inscriptions`);

  const response = await generateFundingAddress({
    address,
    inscriptions,
    padding: 600,
    tip: 0,
    network,
    privKey,
    feeRate,
  });
  console.log(`Pay ${response.amount} to ${response.fundingAddress}`);
  let funded: readonly [string, number, number] | readonly [null, null, null] =
    [null, null, null];
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
  await loopTilAddressReceivesMoney(response.fundingAddress, true, network);
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

  console.log(`Revealing....`);
  const inscriptionIds: string[] = [];

  await loopTilAddressReceivesMoney(
    response.inscriptionsToWrite[0].inscriptionAddress,
    false,
    network,
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  for (let i = 0; i < response.inscriptionsToWrite.length; i++) {
    const inscription = response.inscriptionsToWrite[i];

    const [txid, vout, amount] = await waitForInscriptionFunding(
      inscription,
      network,
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
    inscriptionIds[i] = `${revealTxId}i0`;
    console.log(`Reveal tx id: ${revealTxId}`);
  }

  // map inscriptions to file paths
  const commonPrefix = longestCommonPrefix(inscriptions.map((i) => i.path));
  const inscriptionMap: Record<string, string> = {};
  inscriptionIds.forEach((id, i) => {
    const path = inscriptions[i].path.replace(commonPrefix, "");
    inscriptionMap[path] = id;
  });

  await fs.promises.writeFile(
    outputFile,
    JSON.stringify(inscriptionMap, null, 2),
  );
}

function longestCommonPrefix(choices: string[]): string {
  if (!choices.length) return "";

  let prefix = choices[0];
  for (let i = 1; i < choices.length; i++) {
    while (choices[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (!prefix) return "";
    }
  }
  return prefix;
}
