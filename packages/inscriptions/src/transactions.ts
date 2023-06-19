// const buf = buffer;
// const { Address, Script, Signer, Tap, Tx } = window.tapscript;\
import { Address, Script, Signer, Tap, Tx } from "@cmdcode/tapscript";
import * as cryptoUtils from "@cmdcode/crypto-utils";
import {
  InvalidAddressError,
  InvalidKeyError,
  PaddingTooLowError,
} from "./errors.js";
import {
  BitcoinNetworkNames,
  InscriptionFile,
  WritableInscription,
} from "./types.js";
import {
  buf2hex,
  isValidAddress,
  networkNamesToTapScriptName,
  satsToBitcoin,
} from "./utils.js";
import { createQR } from "./qrcode.js";

export interface InscriptionContent {
  content: ArrayBuffer;
  mimeType: string;
}

export interface PendingTransaction {
  txsize: number;
  vout: number;
  script: string[];
  output: {
    value: number;
    scriptPubKey: string[];
  };
}

export interface FundingAddressRequest {
  inscriptions: InscriptionContent[];
  padding?: number;
  tip: number;
  address: string;
  network: BitcoinNetworkNames;
  privKey: string;
  feeRate: number;
}

export interface FundingAddressResponse {
  fundingAddress: string;
  totalFee: number;
  amount: string;
  qrValue: string;
  qrSrc: string;
  files: InscriptionFile[];
  inscriptionsToWrite: WritableInscription[];
  overhead: number;
  padding: number;
  initScriptBuffer: (string | Uint8Array)[];
  initScript: string[];
  initTapKey: string;
  initLeaf: string;
  initCBlock: string;
  secKey: cryptoUtils.SecretKey;
}

export async function generateFundingAddress({
  address,
  inscriptions,
  padding = 10000,
  tip,
  network,
  privKey,
  feeRate,
}: FundingAddressRequest): Promise<FundingAddressResponse> {
  const files: InscriptionFile[] = [];
  if (!isValidAddress(address)) {
    throw new InvalidAddressError();
  }

  for (const { content, mimeType } of inscriptions) {
    files.push({
      content,
      mimetype: mimeType,
      sha256: "",
    });
  }

  let is_bin = files[0].sha256 != "" ? true : false;
  let min_padding = !is_bin ? 546 : 1000;

  if (
    isNaN(padding) ||
    padding > Number.MAX_SAFE_INTEGER ||
    padding < min_padding
  ) {
    throw new PaddingTooLowError(padding, min_padding);
  }
  let tip_check = tip;
  tip_check = isNaN(tip_check) ? 0 : tip_check;

  const KeyPair = cryptoUtils.KeyPair;

  let secKey = new KeyPair(privKey);
  let pubkey = secKey.pub.x;

  const ec = new TextEncoder();

  const init_script = [pubkey, "OP_CHECKSIG"];

  const init_script_backup = ["0x" + buf2hex(pubkey), "OP_CHECKSIG"];

  let init_leaf = Tap.tree.getLeaf(Script.encode(init_script));
  let [init_tapkey, init_cblock] = Tap.getPubKey(pubkey, {
    target: init_leaf,
  });

  /**
   * This is to test IF the tx COULD fail.
   * This is most likely happening due to an incompatible key being generated.
   */
  const test_redeemtx = Tx.create({
    vin: [
      {
        txid: "a99d1112bcb35845fd44e703ef2c611f0360dd2bb28927625dbc13eab58cd968",
        vout: 0,
        prevout: {
          value: 10000,
          scriptPubKey: ["OP_1", init_tapkey],
        },
      },
    ],
    vout: [
      {
        value: 8000,
        scriptPubKey: ["OP_1", init_tapkey],
      },
    ],
  });

  const test_sig = await Signer.taproot.sign(secKey.raw, test_redeemtx, 0, {
    extension: init_leaf,
  });
  test_redeemtx.vin[0].witness = [test_sig.hex, init_script, init_cblock];
  const isValid = Signer.taproot.verify(test_redeemtx, 0, { pubkey });

  if (!isValid) {
    throw new InvalidKeyError(
      "Generated keys could not be validated. Please reload the app."
    );
  }

  let inscriptionsToWrite: WritableInscription[] = [];
  let total_fee = 0;

  let base_size = 160;

  for (let i = 0; i < files.length; i++) {
    const data = files[i].content;
    const mimetype = ec.encode(files[i].mimetype);
    const dataArray = new Uint8Array(data);
    const script: (string | Uint8Array)[] = [
      pubkey,
      "OP_CHECKSIG",
      "OP_0",
      "OP_IF",
      ec.encode("ord"),
      "01",
      mimetype,
      "OP_0",
      dataArray,
      "OP_ENDIF",
    ];

    const script_backup = [
      "0x" + buf2hex(pubkey.buffer),
      "OP_CHECKSIG",
      "OP_0",
      "OP_IF",
      "0x" + buf2hex(ec.encode("ord")),
      "01",
      "0x" + buf2hex(mimetype),
      "OP_0",
      "0x" + buf2hex(data),
      "OP_ENDIF",
    ];

    const leaf = Tap.tree.getLeaf(Script.encode(script));
    const [tapKey, cblock] = Tap.getPubKey(pubkey, { target: leaf });

    let inscriptionAddress = Address.p2tr.encode(
      tapKey,
      networkNamesToTapScriptName(network)
    );

    let prefix = 160;

    if (files[i].sha256 != "") {
      prefix = feeRate > 1 ? 546 : 700;
    }

    let txsize = prefix + data.byteLength;

    let fee = Math.ceil(feeRate * txsize);
    total_fee += fee;

    inscriptionsToWrite.push({
      leaf: leaf,
      tapkey: tapKey,
      cblock: cblock,
      inscriptionAddress: inscriptionAddress,
      txsize: txsize,
      fee: fee,
      script: script_backup,
      script_orig: script,
    });
  }

  // we are covering 2 times the same outputs, once for seeder, once for the inscribers
  let total_fees =
    total_fee +
    (69 + (inscriptionsToWrite.length + 1) * 2 * 31 + 10) * feeRate +
    base_size * inscriptionsToWrite.length +
    padding * inscriptionsToWrite.length;

  let fundingAddress = Address.p2tr.encode(
    init_tapkey,
    networkNamesToTapScriptName(network)
  );

  let toAddress = address;

  if (!isNaN(tip) && tip >= 500) {
    total_fees += 50 * feeRate + tip;
  }
  total_fees = Math.ceil(total_fees);
  let qr_value =
    "bitcoin:" +
    fundingAddress +
    "?amount=" +
    satsToBitcoin(BigInt(total_fees));

  let overhead = total_fees - total_fee - padding * inscriptions.length - tip;

  if (isNaN(overhead)) {
    overhead = 0;
  }

  if (isNaN(tip)) {
    tip = 0;
  }

  return {
    fundingAddress,
    amount: satsToBitcoin(BigInt(total_fees)),
    qrValue: qr_value,
    qrSrc: await createQR(qr_value),
    files,
    totalFee: total_fee,
    inscriptionsToWrite,
    overhead,
    padding,
    initScriptBuffer: init_script,
    initScript: init_script_backup,
    initTapKey: init_tapkey,
    initLeaf: init_leaf,
    initCBlock: init_cblock,
    secKey,
  };
}

export interface GenesisTransactionRequest {
  inscriptions: WritableInscription[];
  txid: string;
  vout: number;
  amount: number;
  tip?: number;
  padding: number;
  tippingAddress?: string;
  initScriptBuffer: (string | Uint8Array)[];
  initScript: string[];
  initTapKey: string;
  initLeaf: string;
  initCBlock: string;
  secKey: cryptoUtils.SecretKey;
}
export interface GenesisTransactionResponse {}

export async function generateGenesisTransaction({
  inscriptions,
  txid,
  vout,
  amount,
  tip,
  padding,
  tippingAddress,
  initScriptBuffer,
  initScript,
  initTapKey,
  initLeaf,
  initCBlock,
  secKey,
}: GenesisTransactionRequest) {
  let outputs = [];

  const transaction: PendingTransaction[] = [];
  transaction.push({
    txsize: 60,
    vout: vout,
    script: initScript,
    output: { value: amount, scriptPubKey: ["OP_1", initTapKey] },
  });

  for (let i = 0; i < inscriptions.length; i++) {
    outputs.push({
      value: padding + inscriptions[i].fee,
      scriptPubKey: ["OP_1", inscriptions[i].tapkey],
    });

    transaction.push({
      txsize: inscriptions[i].txsize,
      vout: i,
      script: inscriptions[i].script,
      output: outputs[outputs.length - 1],
    });
  }

  if (tip && tippingAddress && !isNaN(tip) && tip >= 500) {
    outputs.push({
      value: tip,
      scriptPubKey: ["OP_1", Address.p2tr.decode(tippingAddress).hex],
    });
  }

  const initRedeemTx = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amount,
          scriptPubKey: ["OP_1", initTapKey],
        },
      },
    ],
    vout: outputs,
  });
  const init_sig = await Signer.taproot.sign(secKey.raw, initRedeemTx, 0, {
    extension: initLeaf,
  });
  initRedeemTx.vin[0].witness = [init_sig.hex, initScriptBuffer, initCBlock];

  let rawTx = Tx.encode(initRedeemTx).hex;
  return rawTx;
}

export interface RevealTransactionRequest {
  inscription: WritableInscription;
  vout: number;
  txid: string;
  amount: number;
  address: string;
  secKey: cryptoUtils.SecretKey;
}

export interface RevealTransactionResponse {}

export async function generateRevealTransaction({
  address,
  inscription,
  vout,
  txid,
  amount,
  secKey,
}: RevealTransactionRequest) {
  const redeemtx = Tx.create({
    vin: [
      {
        txid,
        vout,
        prevout: {
          value: amount,
          scriptPubKey: ["OP_1", inscription.tapkey],
        },
      },
    ],
    vout: [
      {
        value: amount - inscription.fee,
        scriptPubKey: ["OP_1", Address.p2tr.decode(address).hex],
      },
    ],
  });
  const sig = await Signer.taproot.sign(secKey.raw, redeemtx, 0, {
    extension: inscription.leaf,
  });
  redeemtx.vin[0].witness = [
    sig.hex,
    inscription.script_orig,
    inscription.cblock,
  ];
  const rawtx2 = Tx.encode(redeemtx).hex;
  return rawtx2;
}
