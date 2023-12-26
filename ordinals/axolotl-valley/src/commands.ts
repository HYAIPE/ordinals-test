import fs from "fs";
import { createCanvas, renderCanvas } from "@0xflick/assets";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";
import { build } from "esbuild";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import cliProgress from "cli-progress";
import { operations } from "./generate.js";
import { Canvas, Image } from "canvas";

const __dirname = dirname(fileURLToPath(import.meta.url));

function randomUint8ArrayOfLength(length: number) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

export async function generateAssets(out: string, count: number) {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(count, 0);
  const canvas: Canvas = (await createCanvas(569, 569)) as any;
  await fs.promises.mkdir(resolve(out, "./generated/images"), {
    recursive: true,
  });
  await fs.promises.mkdir(resolve(out, "./generated/metadata"), {
    recursive: true,
  });

  await fs.promises.rm(resolve(out, "./generated/images"), { recursive: true });
  await fs.promises.rm(resolve(out, "./generated/metadata"), {
    recursive: true,
  });

  await fs.promises.mkdir(resolve(out, "./generated/images"), {
    recursive: true,
  });
  await fs.promises.mkdir(resolve(out, "./generated/metadata"), {
    recursive: true,
  });
  for (let i = 0; i < count; i++) {
    const seedBytes: Uint8Array = randomUint8ArrayOfLength(32);
    const { metadata, layers } = await operations(
      seedBytes,
      async (imagePath) => {
        const imgData = await fs.promises.readFile(
          resolve(
            __dirname,
            "..",
            "web",
            "properties",
            imagePath.replace(".webp", ".PNG"),
          ),
        );
        const img = new Image();
        img.src = imgData as any;
        return img;
      },
    );
    await renderCanvas(canvas, layers);
    const outData = canvas.toBuffer("image/png");

    fs.promises.writeFile(resolve(out, `./generated/images/${i}.png`), outData);
    fs.promises.writeFile(
      resolve(out, `./generated/metadata/${i}`),
      JSON.stringify(
        {
          ...metadata,
          image: `${i}.png`,
          name: `#${i}`,
        },
        null,
        2,
      ),
    );
    bar.increment();
  }
  bar.stop();
}

export async function generateScript(
  out: string,
  network?: BitcoinNetworkNames,
) {
  const additionalOptions = (() => {
    switch (network) {
      case "mainnet":
        return {
          alias: {
            "inscriptions/index.js": resolve(
              __dirname,
              "inscriptions",
              "mainnet.js",
            ),
          },
        };
      case "testnet":
        return {
          alias: {
            "inscriptions/index.js": resolve(
              __dirname,
              "inscriptions",
              "testnet.js",
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
  console.log("done");
}
