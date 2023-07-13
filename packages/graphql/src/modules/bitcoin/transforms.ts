import { BitcoinNetworkNames } from "@0xflick/ordinals-models";
import { BitcoinNetwork, FeeLevel } from "../../generated-types/graphql.js";
import { IFeesRecommended } from "@0xflick/ordinals-backend";

export function toBitcoinNetworkName(
  bitcoinNetworkName: BitcoinNetwork,
): BitcoinNetworkNames {
  switch (bitcoinNetworkName) {
    case "MAINNET":
      return "mainnet";
    case "TESTNET":
      return "testnet";
    case "REGTEST":
      return "regtest";
    default:
      throw new Error(`Unsupported network: ${bitcoinNetworkName}`);
  }
}

export function toFeeLevel(feeLevel: FeeLevel, fees: IFeesRecommended) {
  switch (feeLevel) {
    case "GLACIAL":
      return fees.minimumFee;
    case "LOW":
      return fees.hourFee;
    case "MEDIUM":
      return fees.halfHourFee;
    case "HIGH":
      return fees.fastestFee;
    default:
      throw new Error(`Unsupported fee level: ${feeLevel}`);
  }
}
