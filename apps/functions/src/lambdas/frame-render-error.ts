import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Canvas, Image, loadImage } from "canvas";
import { operations } from "@0xflick/ordinals-axolotl-valley-render";
import { ILayer } from "@0xflick/assets";
import { utils } from "ethers";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Readable } from "stream";

const s3 = new S3({
  region: "us-east-1",
});

if (!process.env.ASSET_BUCKET) {
  throw new Error("ASSET_BUCKET not set");
}

const generativeAssetsBucket = process.env.ASSET_BUCKET;

async function renderCanvas(canvas: Canvas, layers: ILayer[]) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const layer of [...layers].sort((a, b) => a.zIndex - b.zIndex)) {
    await layer.draw(ctx as any);
  }
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("Received image request");
  try {
    const { pathParameters } = event;
    const header = pathParameters?.header;
    const msg = pathParameters?.message;

    // From seed, generate layers
    const { layers } = await operations(
      utils.arrayify(utils.randomBytes(32)),
      async (imagePath) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: generativeAssetsBucket,
          Key: imagePath.replace(".webp", ".PNG"),
        });

        try {
          const response = await s3.send(getObjectCommand);
          const stream = response.Body as Readable;
          return new Promise<Image>((resolve, reject) => {
            const responseDataChunks: Buffer[] = [];

            // Handle an error while streaming the response body
            stream.once("error", (err) => reject(err));

            // Attach a 'data' listener to add the chunks of data to our array
            // Each chunk is a Buffer instance
            stream.on("data", (chunk) => responseDataChunks.push(chunk));

            // Once the stream has no more data, join the chunks into a string and return the string
            stream.once("end", () => {
              resolve(loadImage(Buffer.concat(responseDataChunks)));
            });
          });
        } catch (err) {
          console.error(`Unable to fetch image ${imagePath}`, err);
          throw err;
        }
      },
    );

    const canvas = new Canvas(569, 569);
    await renderCanvas(canvas, layers);
    const ogMetaCanvas = new Canvas(800, 420);
    const ogMetaCtx = ogMetaCanvas.getContext("2d");
    ogMetaCtx.fillStyle = "red";
    ogMetaCtx.fillRect(0, 0, 800, 420);
    ogMetaCtx.drawImage(canvas, 10, 10, 90, 90);
    ogMetaCtx.fillStyle = "black";
    ogMetaCtx.strokeStyle = "white";
    ogMetaCtx.lineWidth = 3;
    ogMetaCtx.textAlign = "center";
    ogMetaCtx.font = "50px Arial";
    ogMetaCtx.fillText(header, 400, 160);
    ogMetaCtx.font = "40px Arial";
    ogMetaCtx.fillText(msg, 400, 300);

    const imageData = ogMetaCanvas.toBuffer("image/png", {
      compressionLevel: 8,
    });
    return {
      statusCode: 200,
      headers: {
        ["Content-Type"]: "image/png",
      },
      body: imageData.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Oops, something went wrong",
    };
  }
};
