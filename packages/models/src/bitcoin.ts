export type BitcoinNetworkNames = "mainnet" | "testnet" | "regtest";

export function toBitcoinNetworkName(name: string): BitcoinNetworkNames {
  switch (name) {
    case "mainnet":
      return "mainnet";
    case "testnet":
      return "testnet";
    case "regtest":
      return "regtest";
    default:
      throw new Error(`Unknown Bitcoin network name: ${name}`);
  }
}

export function isBitcoinNetworkName(
  name: string
): name is BitcoinNetworkNames {
  try {
    toBitcoinNetworkName(name);
    return true;
  } catch (e) {
    return false;
  }
}
