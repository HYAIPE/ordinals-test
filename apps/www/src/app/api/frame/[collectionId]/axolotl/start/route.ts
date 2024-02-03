import { validateFrameMessage } from "@/frame/validate";
import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { utils } from "ethers";

const NEXT_PUBLIC_FRAME_URL = "https://frame.bitflick.xyz";
const NEXT_PUBLIC_WWW_URL = "https://www.bitflick.xyz";

function startResponse(collectionId: string) {
  const seed = utils.hexlify(utils.randomBytes(32));

  return new NextResponse(
    `
<!DOCTYPE html>
<html>
  <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${NEXT_PUBLIC_FRAME_URL}/frame-og/axolotl/${seed}" />
    <meta property="og:image" content="${NEXT_PUBLIC_FRAME_URL}/frame-og/axolotl/${seed}" />
    <meta property="fc:frame:input:text" content="Enter a BTC taproot address" />
    <meta property="fc:frame:button:1" content="mint 1" />
    <meta property="fc:frame:button:2" content="mint 3" />
    <meta property="fc:frame:button:3" content="mint 5" />
    <meta property="fc:frame:button:4" content="mint 10" />
    <meta property="fc:frame:post_url" content="${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/address" />
  </head>
</html>
`,
    { headers: { "Content-Type": "text/html" } }
  );
}

async function getResponse(
  req: NextRequest,
  collectionId: string
): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { valid } = await validateFrameMessage(body.trustedData.messageBytes);

  if (!valid) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
          "hey"
        )}/${encodeURIComponent("what are you doing")}`,
        buttons: [
          {
            label: "home",
          },
        ],
        post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
      })
    );
  }
  return startResponse(collectionId);
}

export async function GET(
  _: NextRequest,
  { params }: { params: { collectionId: string } }
): Promise<Response> {
  return startResponse(params.collectionId);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
): Promise<Response> {
  return getResponse(req, params.collectionId);
}

export const dynamic = "force-dynamic";
