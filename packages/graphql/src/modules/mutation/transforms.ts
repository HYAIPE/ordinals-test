import { InscriptionContent } from "@0xflick/ordinals-models";
import { InscriptionData } from "../../generated-types/graphql";

export function fileToInscription(file: InscriptionData): InscriptionContent {
  if (!file.textContent && !file.base64Content) {
    throw new Error("No content provided");
  }
  const content = file.base64Content
    ? Buffer.from(file.base64Content, "base64")
    : Buffer.from(file.textContent!, "utf8");
  return {
    content,
    mimeType: file.contentType,
  };
}
