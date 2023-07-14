import {
  KeyLike,
  importJWK,
  importPKCS8,
  CompactDecryptResult,
  SignJWT,
  compactDecrypt,
} from "jose";
import {
  generateRolesFromIds,
  namespacedClaim,
  TokenModel,
  IUserWithRoles,
} from "../models/index.js";
import { sessionExpiration } from "@0xflick/ordinals-backend";

export async function decryptJweToken(
  jwe: string
): Promise<CompactDecryptResult> {
  const key = await jwkKey;
  const decrypted = await compactDecrypt(jwe, key);
  return decrypted;
}

export async function createJwtToken(user: IUserWithRoles): Promise<string> {
  // Create a JWS signed with the private key
  const key = await jwkKey;

  const jws = await new SignJWT({
    ...generateRolesFromIds(user.roleIds),
    [namespacedClaim("nonce")]: user.nonce,
  })
    .setProtectedHeader({
      alg: "ES512",
    })
    .setSubject(user.address)
    .setIssuedAt()
    .setIssuer(TokenModel.JWT_CLAIM_ISSUER)
    .setExpirationTime(Date.now() + 1000 * sessionExpiration)
    .sign(key);
  return jws;
}

export const promisePrivateKey = new Promise<KeyLike>(
  async (resolve, reject) => {
    if ((global as any).promisePrivateKeys) {
      await (global as any).promisePrivateKeys;
    }
    process.env.JWT_PRIVATE_KEY &&
      importPKCS8(process.env.JWT_PRIVATE_KEY, "ECDH-ES+A128KW").then(
        resolve,
        reject
      );
  }
);

export const jwkKey = new Promise<KeyLike>(async (resolve, reject) => {
  if ((global as any).promisePrivateKeys) {
    await (global as any).promisePrivateKeys;
  }
  process.env.JWK &&
    importJWK(JSON.parse(process.env.JWK), "ECDH-ES+A128KW").then((k: any) => {
      resolve(k);
    }, reject);
});
