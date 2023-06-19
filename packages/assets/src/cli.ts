import fs from "fs";
import { Command, InvalidArgumentError } from "commander";
import { utils } from "ethers";
import { Image } from "canvas";
import cliProgress from "cli-progress";
import operations from "./canvas/axolotlValley/generate";
import { createCanvas } from "./canvas/canvas";
import { renderCanvas } from "./canvas/core";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { generateNameflick } from "./generate-nameflick";

const program = new Command();
const __dirname = dirname(fileURLToPath(import.meta.url));

function randomUint8ArrayOfLength(length: number) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

program.version("0.0.1");

program
  .command("one")
  .option("-s, --seed <seed>", "Seed for random number generation")
  .action(async ({ seed }) => {
    const canvas = await createCanvas(569, 569);

    let seedBytes: Uint8Array;
    if (seed) {
      seedBytes = utils.arrayify(seed);
    } else {
      seedBytes = randomUint8ArrayOfLength(32);
    }
    const { metadata, layers } = await operations(
      seedBytes,
      async (imagePath) => {
        const imgData = await fs.promises.readFile(
          resolve(__dirname, "..", "..", "properties", imagePath)
        );
        const img = new Image();
        img.src = imgData;
        return img;
      }
    );
    await renderCanvas(canvas, layers);

    // Save canvas image to file
    const outPath = "./out.png";
    const outData = canvas.toBuffer("image/png");
    fs.promises.writeFile(outPath, outData);
    fs.promises.writeFile("out.json", JSON.stringify(metadata, null, 2));
    console.log(metadata.seed);
  });

function parseIntArg(value: string) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
}

program.command("nameflick <name> <out>").action(async (name, out) => {
  const buffer = await generateNameflick(name, 1);
  await fs.promises.writeFile(out, buffer);
});

program
  .command("generate-all")
  .option("-n, --name <name>", "Name of collection", "Test")
  .option("-c, --count <number>", "Number of NFTs to generate", parseIntArg, 5)
  .option(
    "-n, --no-clean",
    "Don't clean the generated directory before generating",
    false
  )
  .action(async ({ count, noClean, name }) => {
    const bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );
    bar.start(count, 0);
    const canvas = await createCanvas(569, 569);
    await fs.promises.mkdir("./generated/images", { recursive: true });
    await fs.promises.mkdir("./generated/metadata", { recursive: true });
    if (!noClean) {
      await fs.promises.rm("./generated/images", { recursive: true });
      await fs.promises.rm("./generated/metadata", { recursive: true });
    }
    await fs.promises.mkdir("./generated/images", { recursive: true });
    await fs.promises.mkdir("./generated/metadata", { recursive: true });
    for (let i = 0; i < count; i++) {
      const seedBytes: Uint8Array = randomUint8ArrayOfLength(32);
      const { metadata, layers } = await operations(
        seedBytes,
        async (imagePath) => {
          const imgData = await fs.promises.readFile(
            resolve(
              __dirname,
              "..",
              "properties_old",
              imagePath.replace(".webp", ".PNG")
            )
          );
          const img = new Image();
          img.src = imgData;
          return img;
        }
      );
      await renderCanvas(canvas, layers);
      const outData = canvas.toBuffer("image/png");

      fs.promises.writeFile(`./generated/images/${i}.png`, outData);
      fs.promises.writeFile(
        `./generated/metadata/${i}`,
        JSON.stringify(
          {
            ...metadata,
            image: `${i}.png`,
            name: `${name} #${i}`,
          },
          null,
          2
        )
      );
      bar.increment();
    }
    bar.stop();
  });

program.parse(process.argv);
