import { Inter } from "next/font/google";
import { utils } from "ethers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bitflick",
  description: "Bitflick inscription launchpad",
};

const NEXT_PUBLIC_FRAME_URL = "https://frame.bitflick.xyz";
const NEXT_PUBLIC_WWW_URL = "https://www.bitflick.xyz";

export default function RootLayout({
  children,
  params: { collectionId },
}: {
  params: { collectionId: string };
  children: React.ReactNode;
}) {
  const seed = utils.hexlify(utils.randomBytes(32));
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta property="og:site_name" content="bitflick" />
        <meta property="og:title" content="Axolotl Valley" />
        <meta property="og:description" content="mint an axolotl on bitcoin" />
        <meta
          property="og:image"
          content="https://www.bitflick.xyz/images/axolotl.png"
        />
        <meta property="twitter:title" content="Axolotl Valley" />
        <meta
          property="twitter:description"
          content="mint an axolotl on bitcoin"
        />
        <meta content="verification" name="LR1011" />
        <meta
          property="twitter:image"
          content="https://www.bitflick.xyz/images/axolotl.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@0xflick" />
        <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content={`${NEXT_PUBLIC_FRAME_URL}/frame-og/axolotl/${seed}`}
        />
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
          content={`${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/address`}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
