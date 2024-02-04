import { Inter, Roboto } from "next/font/google";
import { promises as fs } from "fs";
import path from "path";
import { createSvgAxolotl } from "@/meta/axolotl";
import { utils } from "ethers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Bitflick",
  description: "Bitflick inscription launchpad",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roboto = await fs.readFile(
    process.cwd() + "/public/fonts/Roboto-Regular.ttf"
  );
  const seed = utils.hexlify(utils.randomBytes(32));
  const previewImageSvg = await createSvgAxolotl({ roboto, seed });
  await fs.writeFile(path.join(process.cwd(), "axolotl.svg"), previewImageSvg);
  const dataSvg = `data:image/svg+xml,${encodeURIComponent(previewImageSvg)}`;
  return (
    <html lang="en">
      <head>
        <meta property="og:site_name" content="bitflick" />
        <meta property="og:title" content="Bitflick Beta" />
        <meta
          property="og:description"
          content="a new way to inscribe on bitcoin"
        />
        <meta property="og:image" content={dataSvg} />
        <meta property="twitter:title" content="Axolotl Valley" />
        <meta
          property="twitter:description"
          content="mint an axolotl on bitcoin"
        />
        <meta content="verification" name="LR1011" />
        <meta property="twitter:image" content={dataSvg} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@0xflick" />
        {/* <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={dataSvg} />
        <meta
          property="fc:frame:input:text"
          content="Enter a BTC taproot address"
        />
        <meta property="fc:frame:button:1" content="mint 1" />
        <meta property="fc:frame:button:2" content="mint 3" />
        <meta property="fc:frame:button:3" content="mint 5" />
        <meta property="fc:frame:button:4" content="mint 10" />
        <meta
          property="fc:frame:post_url"
          content="/api/frame/7d33db3a-8d0f-4fe0-a781-74d314953aae/axolotl/address"
        /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
