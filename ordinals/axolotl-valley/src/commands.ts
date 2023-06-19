import { BitcoinNetworkNames } from "@0xflick/inscriptions";
import { build } from "esbuild";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function generateScript(
  out: string,
  network?: BitcoinNetworkNames
) {
  const additionalOptions = (() => {
    switch (network) {
      case "mainnet":
        return {
          alias: {
            "inscriptions/index.js": resolve(
              __dirname,
              "inscriptions",
              "mainnet.js"
            ),
          },
        };
      case "testnet":
        return {
          alias: {
            "inscriptions/index.js": resolve(
              __dirname,
              "inscriptions",
              "testnet.js"
            ),
          },
        };
      default:
        return {};
    }
  })();
  await build({
    entryPoints: [resolve(__dirname, "ordinal.ts")],
    bundle: true,
    platform: "browser",
    target: "es2022",
    outfile: out,
    minify: true,
    ...additionalOptions,
  });
}
