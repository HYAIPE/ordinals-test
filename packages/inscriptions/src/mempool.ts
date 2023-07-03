import { getData, postData } from "./network.js";
import { BitcoinNetworkNames, WritableInscription } from "./types.js";
import { isValidJson } from "./utils.js";

export function urlForNetworkName(network: BitcoinNetworkNames) {
  switch (network) {
    case "mainnet":
      return "https://mempool.space";
    case "testnet":
      return "https://mempool.space/testnet";
    case "regtest":
      return "http://localhost";
  }
}

export async function broadcastTx(rawTx: string, network: BitcoinNetworkNames) {
  const url = urlForNetworkName(network);
  // try {
  const txId = await postData(url + "/api/tx", rawTx);
  return txId;
}

export async function addressReceivedMoneyInThisTx(
  address: string,
  network: BitcoinNetworkNames
) {
  const url = urlForNetworkName(network);
  let txid: string;
  let vout: number;
  let amt: number;
  let nonjson: any;

  nonjson = await getData(url + "/api/address/" + address + "/txs");

  const json = JSON.parse(nonjson);
  for (const tx of json) {
    for (let i = 0; i < tx["vout"].length; i++) {
      const output = tx["vout"][i];
      if (output["scriptpubkey_address"] == address) {
        txid = tx["txid"];
        vout = i;
        amt = output["value"];
        return [txid, vout, amt] as const;
      }
    }
  }
  return [null, null, null] as const;
}

export async function waitForInscriptionFunding(
  inscription: WritableInscription,
  network: BitcoinNetworkNames
) {
  let funded: readonly [string, number, number] | readonly [null, null, null] =
    [null, null, null];
  do {
    funded = await addressReceivedMoneyInThisTx(
      inscription.inscriptionAddress,
      network
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (funded[0] == null);
  const [txid, vout, amount] = funded;
  return [txid, vout, amount] as const;
}

export async function addressOnceHadMoney(
  address: string,
  includeMempool: boolean,
  network: BitcoinNetworkNames
) {
  let url = urlForNetworkName(network);
  let nonjson;

  url += "/api/address/" + address;
  nonjson = await getData(url);

  if (!isValidJson(nonjson)) return false;
  let json = JSON.parse(nonjson);
  if (
    json["chain_stats"]["tx_count"] > 0 ||
    (includeMempool && json["mempool_stats"]["tx_count"] > 0)
  ) {
    return true;
  }
  return false;
}

export async function loopTilAddressReceivesMoney(
  address: string,
  includeMempool: boolean,
  network: BitcoinNetworkNames
) {
  let itReceivedMoney = false;

  async function isDataSetYet(data_i_seek: unknown) {
    return new Promise(function (resolve) {
      if (!data_i_seek) {
        setTimeout(async function () {
          console.log("waiting for address to receive money...");
          try {
            itReceivedMoney = await addressOnceHadMoney(
              address,
              includeMempool,
              network
            );
          } catch (e) {}
          let msg = await isDataSetYet(itReceivedMoney);
          resolve(msg);
        }, 2000);
      } else {
        resolve(data_i_seek);
      }
    });
  }
  async function getTimeoutData() {
    let data_i_seek = await isDataSetYet(itReceivedMoney);
    return data_i_seek;
  }

  let returnable = await getTimeoutData();
  return returnable;
}
