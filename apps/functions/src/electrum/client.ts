// uses electrum.d.ts
//
import ElectrumClient from "@mempool/electrum-client";
import { Address } from "@cmdcode/tapscript";

const port = Number.isInteger(Number(process.env.ELECTRUM_PORT))
  ? Number(process.env.ELECTRUM_PORT)
  : 50002;
const host = process.env.ELECTRUM_HOST || "bitcoin.aranguren.org";
const protocol = process.env.ELECTRUM_PROTOCOL || "tls";

console.log(`Connecting to ${host}:${port} over ${protocol}`);
const client = new ElectrumClient(
  port,
  host,
  protocol,
  {},
  {
    onConnect: () => {
      console.log("connected");
    },
    onClose: () => {
      console.log("closed");
    },
    onLog: (str: string) => {
      console.log(str);
    },
  }
);
await client.initElectrum({
  client: "nodejs",
  version: "1.4",
});
console.log(client.versionInfo);

const balance = await client.blockchainScripthash_listunspent(
  Buffer.from(
    "5e029985cad773cc75877168c7588ab6741cfa42634a8c963e89f8f371830755",
    "hex"
  )
    .reverse()
    .toString("hex")
  // "f46ebcb0bc37224369f8841bfe0bf42742d2291581208920678bd9bea0552513"
  // Address.p2tr
  //   .decode("bcrt1qg7gq7ytj0nkde7p27tcvjrmw8q7gyvlqsy6pcw")
  //   .toString("hex")
);
console.log(balance);

export default client;
