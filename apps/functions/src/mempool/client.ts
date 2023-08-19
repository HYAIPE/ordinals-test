import mempoolJS from "@0xflick/mempool.js";
// import { inspect } from "util";

const { bitcoin } = mempoolJS({
  protocol: "http",
  hostname: "172.17.0.1:8080",
  network: "regtest",
});

export const getBitcoinAddressTxsUtxo = async (address: string) => {
  return await bitcoin.addresses.getAddressTxsUtxo({
    address,
  });
};
