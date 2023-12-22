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
    let stderr = "";
    proc.stderr.on("data", (data) => {
      stderr += data;
    });
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        console.error(stderr);
        reject(new CodeError(code));
      }
    });
  });
}

export async function loadWallet({
  network,
  rpcuser,
  rpcpassword,
  wallet,
  bitcoinDataDir,
}: {
  network: BitcoinNetworkNames;
  rpcuser: string;
  rpcpassword: string;
  wallet: string;
  bitcoinDataDir?: string;
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
    ...(bitcoinDataDir ? ["-datadir=" + bitcoinDataDir] : []),
    "-rpcuser=" + rpcuser,
    "-rpcpassword=" + rpcpassword,
    "loadwallet",
    wallet,
  ];
  console.log("bitcoin-cli", args.join(" "));
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
  bitcoinDataDir,
}: {
  network: BitcoinNetworkNames;
  rpcuser: string;
  rpcpassword: string;
  rpcwallet: string;
  outputs: [string, string][];
  fee_rate: number;
  bitcoinDataDir?: string;
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
    ...(bitcoinDataDir ? ["-datadir=" + bitcoinDataDir] : []),
    "-rpcuser=" + rpcuser,
    "-rpcpassword=" + rpcpassword,
    "-rpcwallet=" + rpcwallet,
    "-named",
    "send",
    "outputs=" + JSON.stringify(Object.fromEntries(outputs)),
    "fee_rate=" + fee_rate,
  ];
  console.log("bitcoin-cli", args.join(" "));
  const stdout = await spawnAsync("bitcoin-cli", args);
  return JSON.parse(stdout);
}

export async function generateOrdinalAddress({
  network,
  bitcoinDataDir,
}: {
  network: BitcoinNetworkNames;
  bitcoinDataDir?: string;
}) {
  const networkFlag = (() => {
    switch (network) {
      case "regtest":
        return "--regtest";
      case "testnet":
        return "--testnet";
      case "mainnet":
        return null;
      default:
        throw new Error(`Unknown network ${network}`);
    }
  })();

  const args = [
    ...(networkFlag ? [networkFlag] : []),
    ...(bitcoinDataDir ? ["--bitcoin-data-dir", bitcoinDataDir] : []),
    "wallet",
    "receive",
  ];
  console.log("ord", args.join(" "));
  const stdout = await spawnAsync("ord", args);
  const { address } = JSON.parse(stdout.trim());
  return address;
}
