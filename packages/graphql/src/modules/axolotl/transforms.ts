import { InscriptionContent, TFundingStatus } from "@0xflick/ordinals-models";
import {
  FundingStatus,
  InscriptionData,
} from "../../generated-types/graphql.js";

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

export function toGraphqlFundingStatus(status: TFundingStatus): FundingStatus {
  switch (status) {
    case "funded":
      return "FUNDED";
    case "funding":
      return "FUNDING";
    case "genesis":
      return "GENESIS";
    case "reveal":
      return "REVEAL";
    default:
      throw new Error(`Unsupported funding status: ${status}`);
  }
}
