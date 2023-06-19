import fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import { minify } from "html-minifier-terser";

const { compile } = handlebars;
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function generateHTML(
  scriptUrl: string,
  tokenId: number,
  genesis: boolean,
  revealedAt: number
) {
  const htmlText = await fs.promises.readFile(
    resolve(__dirname, "..", "html", "index.hbs"),
    "utf8"
  );
  const template = compile(htmlText);

  const renderedHtml = template({
    scriptUrl,
    tokenId,
    genesis,
    revealedAt,
  });

  return await minify(renderedHtml, {
    minifyCSS: true,
    minifyJS: true,
    collapseWhitespace: true,
    removeComments: true,
  });
}
