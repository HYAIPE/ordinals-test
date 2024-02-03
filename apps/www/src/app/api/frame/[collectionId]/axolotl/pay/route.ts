import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { validateFrameMessage } from "@/frame/validate";
import { FrameRequest } from "@coinbase/onchainkit";

const NEXT_PUBLIC_WWW_URL = "https://www.bitflick.xyz";

export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
): Promise<Response> {
  const body: FrameRequest = await req.json();
  const { message } = await validateFrameMessage(body.trustedData.messageBytes);
  const index = message.data.frameActionBody.buttonIndex ?? 1;
  switch (index) {
    case 1:
      // return redirect(`${NEXT_PUBLIC_WWW_URL}/pay/${params.collectionId}`);
      return new NextResponse("OK", {
        status: 302,
        headers: {
          Location: `${NEXT_PUBLIC_WWW_URL}/pay/${params.collectionId}`,
        },
      });
    case 2:
    default:
      // return redirect(`${NEXT_PUBLIC_WWW_URL}/status/${params.collectionId}`);
      return new NextResponse("OK", {
        status: 302,
        headers: {
          Location: `${NEXT_PUBLIC_WWW_URL}/status/${params.collectionId}`,
        },
      });
  }
}

export const dynamic = "force-dynamic";
