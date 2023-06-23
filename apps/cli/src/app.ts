import { Command } from "commander";
import fs from "fs";
import {
  generateScript,
  generateHTML,
  generateAssets,
} from "@0xflick/ordinals-axolotl-valley";
import { generatePrivateKey } from "./commands/generatePrivateKey.js";
import { testMintOrdinals } from "./commands/testMintOrdinal.js";
import { bulkMint } from "./commands/bulkMint.js";
import { mintSingle } from "./commands/mintSingle.js";
const program = new Command();

program
  .command("privkey")
  .description("Generate a new private key")
  .action(() => {
    generatePrivateKey();
  });

program
  .command("test-mint-ordinal <address>")
  .option("-n, --network <network>", "Bitcoin network", "regtest")
  .description("Mint an ordinal")
  .action(async (address, { network }) => {
    await testMintOrdinals({ address, network });
  });

program
  .command("mint <file>")
  .option("-n, --network <network>", "Bitcoin network", "regtest")
  .option("-a, --address <address>", "Address to mint to")
  .option("-m, --mime-type <mime-type>", "Mime type of file")
  .option("-f, --fee-rate <fee-rate>", "Fee rate in satoshis per vbyte")
  .description("Mint an ordinal")
  .action(async (file, { network, address, mimeType, feeRate }) => {
    await mintSingle({ file, network, address, mimeType, feeRate });
  });

program
  .command("bulk-mint <address>, <glob>")
  .option("-n, --network <network>", "Bitcoin network", "regtest")
  .option("-o, --output <output>", "Output file")
  .option("-p, --privkey <privkey>", "Private key")
  .description("Mint ordinals in bulk")
  .action(async (address, glob, { network, output, privkey }) => {
    await bulkMint({
      address,
      globStr: glob,
      network,
      outputFile: output,
      privKey: privkey,
    });
  });

program
  .command("hex-to-text <hex>")
  .description("Convert hex to text")
  .action((hex) => {
    console.log(Buffer.from(hex, "hex").toString("utf8"));
  });

const axolotlValley = program.command("axolotl-valley");
axolotlValley
  .command("script <out>")
  .option("-n, --network <network>", "Bitcoin network")
  .description("Generate the axolotl-valley script")
  .action(async (out, { network }) => {
    await generateScript(out, network);
  });

axolotlValley
  .command("html <out>")
  .option("-s, --script <scriptUrl>", "script url4")
  .option("-t, --token-id <tokenId>", "token id")
  .option("-g, --genesis", "a genesis token")
  .option("-r, --reveal-height <height>", "reveal token at height")
  .action(async (out, { script, tokenId, genesis, revealHeight }) => {
    const result = await generateHTML(script, tokenId, genesis, revealHeight);
    await fs.promises.writeFile(out, result, "utf8");
  });

axolotlValley
  .command("generate <out>")
  .option("-c, --count <count>", "number of tokens to generate", Number, 50)
  .action(async (out, { count }) => {
    await generateAssets(out, count);
  });

program.parse(process.argv);
