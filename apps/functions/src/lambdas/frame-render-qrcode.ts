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
    const qrValue = `bitcoin:${address}?amount=${satsToBitcoin(
      BigInt(amount),
    )}`;
    console.log(`qrValue: ${qrValue}`);

    const s3Key = `qr/${address}/${amount}.png`;
    const exists = await s3Exists({ key: s3Key, bucket: seedImageBucket });

    if (!exists) {
      console.log(`Qr image not found in S3: ${s3Key}`);
      const qrSrc = await createQR(qrValue);
      const qrImg = await loadImage(qrSrc);
      // Render canvas
      console.log("Creating canvas");
      const canvas = new Canvas(800, 420);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 800, 420);
      ctx.drawImage(qrImg, 40, 40, 310, 310);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "30px Arial";
      ctx.fillText("Payment request", 600, 150);
      ctx.font = "20px Arial";
      ctx.fillText(`${satsToBitcoin(BigInt(amount))} BTC`, 600, 200);
      ctx.fillText("to", 600, 250);
      ctx.font = "15px Arial";
      ctx.fillText(address, 600, 300);

      const imageData = canvas.toBuffer("image/png", { compressionLevel: 8 });
      // await s3WriteObject(s3Key, imageData);
      return {
        statusCode: 200,
        headers: {
          ["Content-Type"]: "image/png",
        },
        body: imageData.toString("base64"),
        isBase64Encoded: true,
      };
    }
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
