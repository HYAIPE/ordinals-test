// import { promises as fs } from "fs";
// import path from "path";

// import { NextRequest, NextResponse } from "next/server";
// import { createSvgAxolotl } from "@/meta/axolotl";

// const previewImageSvg = await createSvgAxolotl({
//   roboto: await fs.readFile(),
//   seed,
// });

// export async function GET(req: NextRequest): Promise<Response> {
//   return new NextResponse(previewImageSvg, {
//     headers: {
//       "Content-Type": "image/svg+xml",
//     },
//   });
// }
