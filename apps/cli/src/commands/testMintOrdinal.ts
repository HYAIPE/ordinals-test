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

function str2ab(text: string) {
  return new TextEncoder().encode(text);
}
const testInscriptions = [
  {
    content: str2ab("Hello World 1"),
    mimeType: "text/plain;charset=utf-8",
  },
  {
    content: str2ab("Hello World 2"),
    mimeType: "text/plain;charset=utf-8",
  },
];

export async function testMintOrdinals({
  address,
  network,
}: {
  address: string;
  network: BitcoinNetworkNames;
}) {
  const privKey = generatePrivKey();
  console.log(`privKey: ${privKey}`);
  const response = await generateFundingAddress({
    address,
    inscriptions: testInscriptions,
    padding: 10000,
    tip: 0,
    network,
    privKey,
    feeRate: 1,
  });
  console.log(`Pay ${response.amount} to ${response.fundingAddress}`);
  let funded: readonly [string, number, number] | readonly [null, null, null] =
    [null, null, null];
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
  await Promise.all(
    response.inscriptionsToWrite.map(async (inscription) => {
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
      console.log(`Reveal tx: ${revealTx}`);
      const revealTxId = await broadcastTx(revealTx, network);
      console.log(`Reveal tx id: ${revealTxId}`);
    })
  );
}
