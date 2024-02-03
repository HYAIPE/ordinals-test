import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bitflick",
  description: "Bitflick inscription launchpad",
};

export default function RootLayout({
  children,
}: {
  params: { collectionId: string };
  children: React.ReactNode;
}) {
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

        {/* <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content={`https://frame.bitflick.xyz/frame-og/axolotl/${seedStr}`}
        />
        <meta
          property="fc:frame:post_url"
          content={`https://www.bitflick.xyz/api/frame/axoltl/${collectionId}`}
        />
        <meta property="fc:frame:button:1" content="claim" /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
