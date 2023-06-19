import QRCode from "qrcode";

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
