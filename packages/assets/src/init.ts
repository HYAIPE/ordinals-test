import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { IPFSHTTPClient } from "ipfs-http-client";

const __dirname = dirname(fileURLToPath(import.meta.url));

function addViaIpfsClient(
  client: IPFSHTTPClient,
  candidate: Parameters<IPFSHTTPClient["add"]>[0],
  name: string
): ReturnType<IPFSHTTPClient["add"]> {
  const startTime = Date.now();
  console.log(`Adding ${name} to IPFS...`);
  return new Promise((resolve, reject) => {
    client.add(candidate).then((result) => {
      const time = (Date.now() - startTime) / 1000;
      console.log(`Finish adding ${name} in ${time.toFixed(2)}s`);
      resolve(result);
    }, reject);
  });
}
