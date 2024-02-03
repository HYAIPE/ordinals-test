import { getSdk } from "@/apiGraphql/claim.generated";
import { validateFrameMessage } from "@/frame/validate";
import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit";
import { GraphQLClient } from "graphql-request";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "@0xflick/tapscript";
import { BitcoinNetwork } from "@/graphql/types";

const NEXT_PUBLIC_FRAME_URL = "https://frame.bitflick.xyz";
const NEXT_PUBLIC_WWW_URL = "https://www.bitflick.xyz";

async function getResponse(
  req: NextRequest,
  collectionId: string
): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { valid, message } = await validateFrameMessage(
    body.trustedData.messageBytes
  );

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
        post_url: `${NEXT_PUBLIC_FRAME_URL}/api/frame/${collectionId}/axolotl/start`,
      })
    );
  }

  // verify input
  const input = message.data.frameActionBody.inputText;
  // console.log(JSON.stringify(message, null, 2));
  if (!input) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
          "hey"
        )}/${encodeURIComponent("include an address")}`,
        buttons: [
          {
            label: "home",
          },
        ],
        post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
      })
    );
  }
  const inputText = Buffer.from(input, "base64").toString("utf-8");
  try {
    const address = Address.decode(inputText);
    if (address.type !== "p2tr") {
      return new NextResponse(
        getFrameHtmlResponse({
          image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
            "invalid address"
          )}/${encodeURIComponent("not a taproot address")}`,
          buttons: [
            {
              label: "home",
            },
          ],
          post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
        })
      );
    }

    if (address.network !== "main") {
      return new NextResponse(
        getFrameHtmlResponse({
          image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
            "invalid network"
          )}/${encodeURIComponent("not a mainnet address")}`,
          buttons: [
            {
              label: "home",
            },
          ],
          post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
        })
      );
    }

    const buttonIndex = message.data.frameActionBody.buttonIndex;
    if (typeof buttonIndex !== "number") {
      return new NextResponse(
        getFrameHtmlResponse({
          image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
            "invalid button"
          )}/${encodeURIComponent("not a number")}`,
          buttons: [
            {
              label: "home",
            },
          ],
          post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
        })
      );
    }

    let claimCount: number;
    switch (buttonIndex) {
      case 1:
        claimCount = 1;
        break;
      case 2:
        claimCount = 3;
        break;
      case 3:
        claimCount = 5;
        break;
      case 4:
        claimCount = 10;
        break;
      default:
        return new NextResponse(
          getFrameHtmlResponse({
            image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
              "invalid button"
            )}/${encodeURIComponent("not a valid button")}`,
            buttons: [
              {
                label: "home",
              },
            ],
            post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
          })
        );
    }

    const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!);
    const sdk = getSdk(client);

    try {
      const {
        axolotlFundingOpenEditionRequest: { data, problems },
      } = await sdk.openEditionClaim({
        request: {
          collectionId,
          destinationAddress: inputText,
          network: BitcoinNetwork.Mainnet,
          claimCount,
        },
      });
      if (problems?.length && !data) {
        return new NextResponse(
          getFrameHtmlResponse({
            image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
              "graphql"
            )}/${encodeURIComponent(problems[0].message)}`,
            buttons: [
              {
                label: "home",
              },
            ],
            post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
          })
        );
      }
      if (!data || !data.inscriptionFunding) {
        return new NextResponse(
          getFrameHtmlResponse({
            image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
              "graphql"
            )}/${encodeURIComponent("no data")}`,
            buttons: [
              {
                label: "home",
              },
            ],
            post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
          })
        );
      }

      const {
        id,
        inscriptionFunding: { fundingAddress, fundingAmountSats },
      } = data;

      return new NextResponse(
        getFrameHtmlResponse({
          image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/qr/${fundingAddress}/${fundingAmountSats}`,
          buttons: [
            {
              label: "pay with xverse",
              action: "post_redirect",
            },
            {
              label: "status",
              action: "post_redirect",
            },
          ],
          post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${id}/axolotl/pay`,
        })
      );
    } catch (error) {
      return new NextResponse(
        getFrameHtmlResponse({
          image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
            "graphql"
          )}/${encodeURIComponent("error")}`,
          buttons: [
            {
              label: "home",
            },
          ],
          post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
        })
      );
    }
  } catch (error) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
          "invalid address"
        )}/${encodeURIComponent("not a valid address")}`,
        buttons: [
          {
            label: "home",
          },
        ],
        post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${collectionId}/axolotl/start`,
      })
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
): Promise<Response> {
  try {
    return getResponse(req, params.collectionId);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${NEXT_PUBLIC_FRAME_URL}/frame-og/error/${encodeURIComponent(
          "whoops"
        )}/${encodeURIComponent("unknown error")}`,
        buttons: [
          {
            label: "home",
          },
        ],
        post_url: `${NEXT_PUBLIC_WWW_URL}/api/frame/${params.collectionId}/axolotl/start`,
      })
    );
  }
}

export const dynamic = "force-dynamic";
