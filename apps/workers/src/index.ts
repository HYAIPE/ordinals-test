import { parse } from "dotenv";
import "dotenv/config";
import path from "path";
import { spawnSync } from "child_process";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto as any;

// export function textFromSecret() {
//   const { stdout, stderr } = spawnSync("sops", ["--decrypt", ".env.graphql"], {
//     cwd: path.join("../../secrets/bitflick.xyz"),
//     encoding: "utf8",
//     env: process.env,
//   });
//   if (stderr) {
//     throw new Error(stderr);
//   }
//   return stdout;
// }

process.env = {
  LOG_LEVEL: "debug",
  ...process.env,
  // ...parse(textFromSecret()),
};

await import("./app.js");
