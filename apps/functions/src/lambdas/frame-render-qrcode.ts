import { S3 } from "@aws-sdk/client-s3";
import { Canvas, loadImage } from "canvas";
import { APIGatewayProxyHandler, APIGatewayProxyHandlerV2 } from "aws-lambda";
import QRCode from "qrcode";
import { satsToBitcoin } from "@0xflick/inscriptions";

export async function createQR(content: string) {
  const url = await QRCode.toDataURL(content, {
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    margin: 4,
    type: "image/png",
  });

  return url;
}
const s3 = new S3({
  region: "us-east-1",
});

if (!process.env.SEED_BUCKET) {
  throw new Error("SEED_BUCKET not set");
}
if (!process.env.IMAGE_HOST) {
  throw new Error("IMAGE_HOST not set");
}

const seedImageBucket = process.env.SEED_BUCKET;
const imageHost = process.env.IMAGE_HOST;

async function s3Exists({
  key,
  bucket,
}: {
  key: string;
  bucket: string;
}): Promise<boolean> {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    await s3.headObject(params);
    return true;
  } catch (err) {
    return false;
  }
}

async function s3WriteObject(key: string, imageData: Buffer): Promise<void> {
  console.log(`Writing to s3://${seedImageBucket}/${key}`);

  await s3.putObject({
    Bucket: seedImageBucket,
    Key: key,
    Body: imageData,
    ContentDisposition: "inline",
    ContentType: "image/png",
    Expires: new Date(Date.now() + 1000 * 60 * 60 * 6),
  });
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { pathParameters } = event;

    const address = pathParameters.address;
    const amount = pathParameters.amount;
    const qrValue = `bitcoin:${address}?amount=${amount}`;
    console.log(`qrValue: ${qrValue}`);

    const s3Key = `qr/${address}/${amount}.png`;
    const exists = await s3Exists({ key: s3Key, bucket: seedImageBucket });

    if (!exists) {
      console.log(`Qr image not found in S3: ${s3Key}`);
      const qrSrc = await createQR(qrValue);
      const qrImg = await loadImage(qrSrc);
      // Render canvas
      console.log("Creating canvas");
      const canvas = new Canvas(800, 400);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 800, 400);
      ctx.drawImage(qrImg, 50, 50, 300, 300);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "30px Arial";
      ctx.fillText("Payment request", 600, 100);
      ctx.font = "20px Arial";
      ctx.fillText(`${satsToBitcoin(BigInt(amount))} BTC`, 600, 150);
      ctx.fillText("to", 600, 200);
      ctx.font = "10px Arial";
      ctx.fillText(address, 600, 250);

      // Save canvas to S3
      console.log("Fetching image from canvas");
      const imageData = canvas.toBuffer("image/png", { compressionLevel: 8 });
      console.log("Saving canvas to S3");
      await s3WriteObject(s3Key, imageData);
      console.log("Done");
      return {
        statusCode: 302,
        headers: {
          ["Location"]: `https://${imageHost}/${s3Key}`,
        },
        body: "",
      };
    }
    console.log(`Seed image found in S3: ${s3Key}`);
    console.log("Returning image");
    return {
      statusCode: 302,
      headers: {
        ["Location"]: `https://${imageHost}/${s3Key}`,
      },
      body: "",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Oops, something went wrong",
    };
  }
};
