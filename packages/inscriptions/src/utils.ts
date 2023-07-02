import { Network, validate } from "bitcoin-address-validation";
import { Address, Networks } from "@cmdcode/tapscript";
import * as secp from "@noble/secp256k1";
import { BitcoinNetworkNames } from "./types";

export function generatePrivKey() {
  return bytesToHex(secp.utils.randomPrivateKey());
}

export function encodeBase64(file: File) {
  return new Promise(function (resolve, reject) {
    let imgReader = new FileReader();
    imgReader.onloadend = function () {
      resolve(imgReader.result?.toString());
    };
    imgReader.onerror = reject;
    imgReader.readAsDataURL(file);
  });
}

export function base64ToHex(str: string) {
  const raw = atob(str);
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : "0" + hex;
  }
  return result.toLowerCase();
}

export function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string) {
  return Uint8Array.from(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}

export function bytesToHex(bytes: Uint8Array) {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}

export function textToHex(text: string) {
  var encoder = new TextEncoder().encode(text);
  return [...new Uint8Array(encoder)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidAddress(address: string) {
  if (!isValidTaprootAddress(address)) {
    return false;
  }

  return true;
}

export function isValidTaprootAddress(address: string) {
  try {
    Address.p2tr.decode(address).hex;
    return true;
  } catch (e) {
    console.log(e);
  }
  return;
}

export function isValidJson(content: string) {
  if (!content) return;
  try {
    JSON.parse(content);
  } catch (e) {
    return;
  }
  return true;
}

export function satsToBitcoin(sats: bigint) {
  if (sats >= 100000000n) sats = sats * 10n;
  let string =
    String(sats).padStart(8, "0").slice(0, -9) +
    "." +
    String(sats).padStart(8, "0").slice(-9);
  if (string.substring(0, 1) == ".") string = "0" + string;
  return string;
}

export function bitcoinToSats(bitcoin: string): bigint {
  let [whole, decimal] = bitcoin.split(".");
  if (!decimal) decimal = "0";
  if (decimal.length > 8) decimal = decimal.slice(0, 8);
  if (decimal.length < 8) decimal = decimal.padEnd(8, "0");
  return BigInt(whole) * 100000000n + BigInt(decimal);
}
export function arrayBufferToBuffer(ab: ArrayBuffer) {
  return Buffer.from(new Uint8Array(ab));
}

export function hexString(buffer: ArrayBuffer) {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map((value) => {
    return value.toString(16).padStart(2, "0");
  });

  return "0x" + hexCodes.join("");
}

export async function fileToArrayBuffer(file: File) {
  return new Promise<string | ArrayBuffer | null>(function (resolve, reject) {
    const reader = new FileReader();
    const readFile = function () {
      const buffer = reader.result;
      resolve(buffer);
    };

    reader.addEventListener("load", readFile);
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(file);
  });
}

export async function bufferToSha256(bufferOrString: string | ArrayBuffer) {
  return crypto.subtle.digest(
    "SHA-256",
    typeof bufferOrString === "string"
      ? Buffer.from(bufferOrString)
      : arrayBufferToBuffer(bufferOrString)
  );
}

export async function fileToSha256Hex(file: File) {
  const buffer = await fileToArrayBuffer(file);
  if (!buffer) {
    throw new Error("Could not read file");
  }
  const hash = await bufferToSha256(buffer);
  return hexString(hash);
}

export function networkNamesToNetworkEnum(
  network: BitcoinNetworkNames
): Network {
  switch (network) {
    case "mainnet":
      return Network.mainnet;
    case "testnet":
      return Network.testnet;
    case "regtest":
      return Network.regtest;
    default:
      throw new Error("Invalid network");
  }
}

export function networkNamesToTapScriptName(
  network: BitcoinNetworkNames
): Networks {
  switch (network) {
    case "mainnet":
      return "main";
    default:
      return network;
  }
}

export async function validateAddress(
  address: string,
  network: BitcoinNetworkNames
) {
  return validate(address, networkNamesToNetworkEnum(network));
}
