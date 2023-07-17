# @0xflick/inscriptions

A NodeJS package for creating inscriptions

Based on https://github.com/BennyTheDev/inscriptions-online but decoupled from the UI, converted to Typescript, and supporting regtest

Example flow:

```js
import {
  addressReceivedMoneyInThisTx,
  broadcastTx,
  generateFundingAddress,
  generateRefundTransaction,
  generateGenesisTransaction,
  generateRevealTransaction,
  waitForInscriptionFunding,
} from "@0xflick/inscriptions";

// Generate a funding address, to kick off a new inscription
const {
  amount,
  fundingAddress,
  initCBlock,
  initLeaf,
  initScript,
  initTapKey,
  inscriptionsToWrite,
  overhead,
  padding,
  totalFee,
  files,
} = await generateFundingAddress({
  address,
  inscriptions: [
    {
      content: Buffer.from(
        JSON.stringify({
          p: "brc20",
          op: "deploy",
          tick: "FLCK",
          max: "1000",
          lim: "1",
        }),
      ),
      mimeType: "application/json",
    },
  ],
  padding: 546,
  tip: 0,
  network,
  privKey,
  feeRate,
});

console.log(`Pay ${amount} to ${fundingAddress}`);
// Wait for that funding address to be funded
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

let [txid, vout, amountFunded] = funded;
if (amountFunded != amount) {
  throw new Error("Incorrect funding amount");
}

// Create the genesis ordinal inscription transaction, which creates spendable outputs
// (one per inscription) which contains enough fees to reveal
// the ordinal and the tapscript proof for the reveal script (the inscription)
const genesisTx = await generateGenesisTransaction({
  amount,
  initCBlock,
  initLeaf,
  initScript,
  initTapKey,
  inscriptions,
  padding,
  secKey,
  txid,
  vout,
});
const genesisTxId = await broadcastTx(genesisTx, network);
console.log(`Genesis tx id: ${genesisTxId}`);
for (let i = 0; i < response.inscriptionsToWrite.length; i++) {
  const inscription = inscriptionsToWrite[i];

  const [txid, vout, amount] = await waitForInscriptionFunding(
    inscription,
    network
  );
  // Reveal the ordinal
  const revealTx = await generateRevealTransaction({
    amount,
    inscription,
    address,
    secKey: response.secKey,
    txid,
    vout,
  });
  const revealTxId = await broadcastTx(revealTx, network);
  console.log(`Reveal tx id: ${revealTxId}`);
}
```
