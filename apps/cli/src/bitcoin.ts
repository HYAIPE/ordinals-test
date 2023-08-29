import { spawn } from "child_process";
import { BitcoinNetworkNames } from "@0xflick/inscriptions";

export class CodeError extends Error {
  constructor(public code: number) {
    super(`Exited with code ${code}`);
  }
}

async function spawnAsync(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    proc.on("error", reject);
    let stdout = "";
    proc.stdout.on("data", (data) => {
      stdout += data;
    });
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new CodeError(code));
      }
    });
  });
}

// bitcoin-cli -regtest -rpcuser=electrum -rpcpassword=9bmpgU2HhdhtIDhYMDNy5MPcyB5MKDYRUxbVgKvcsGw loadwallet default
export async function loadWallet({
  network,
  rpcuser,
  rpcpassword,
  wallet,
}: {
  network: BitcoinNetworkNames;
  rpcuser: string;
  rpcpassword: string;
  wallet: string;
}): Promise<{
  name: string;
}> {
  const networkFlag = (() => {
    switch (network) {
      case "regtest":
        return "-regtest";
      case "testnet":
        return "-testnet";
      case "mainnet":
        return null;
      default:
        throw new Error(`Unknown network ${network}`);
    }
  })();
  const args = [
    ...(networkFlag ? [networkFlag] : []),
    "-rpcuser=" + rpcuser,
    "-rpcpassword=" + rpcpassword,
    "loadwallet",
    wallet,
  ];
  try {
    const stdout = await spawnAsync("bitcoin-cli", args);
    return JSON.parse(stdout);
  } catch (e) {
    if (e instanceof CodeError && e.code === 35) {
      // Wallet already loaded
      return { name: wallet };
    }
    throw e;
  }
}

export async function sendBitcoin({
  network,
  rpcuser,
  rpcpassword,
  rpcwallet,
  outputs,
  fee_rate,
}: {
  network: BitcoinNetworkNames;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
  outputs: [string, string][];
  fee_rate: number;
}): Promise<{
  txid: string;
  complete: boolean;
}> {
  const networkFlag = (() => {
    switch (network) {
      case "regtest":
        return "-regtest";
      case "testnet":
        return "-testnet";
      case "mainnet":
        return null;
      default:
        throw new Error(`Unknown network ${network}`);
    }
  })();
  const args = [
    ...(networkFlag ? [networkFlag] : []),
    "-rpcuser=" + rpcuser,
    "-rpcpassword=" + rpcpassword,
    "-rpcwallet=" + rpcwallet,
    "-named",
    "send",
    "outputs=" + JSON.stringify(Object.fromEntries(outputs)),
    "fee_rate=" + fee_rate,
  ];
  const stdout = await spawnAsync("bitcoin-cli", args);
  return JSON.parse(stdout);
}
