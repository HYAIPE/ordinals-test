import {
  KeyLike,
  importJWK,
  importPKCS8,
  CompactDecryptResult,
  SignJWT,
  compactDecrypt,
  JWTPayload,
  JWTVerifyResult,
} from "jose";
import {
  generateRolesFromIds,
  namespacedClaim,
  TokenModel,
  IUserWithRoles,
} from "@0xflick/ordinals-rbac-models";

export async function decryptJweToken(
  jwe: string,
): Promise<CompactDecryptResult> {
  const key = await jwkKey;
  const decrypted = await compactDecrypt(jwe, key);
  return decrypted;
}

export async function createJwtTokenSingleSubject({
  user,
  nonce,
  payload,
}: {
  user: IUserWithRoles;
  nonce: string;
  payload?: JWTPayload;
}): Promise<string> {
  // Create a JWS signed with the private key
  const key = await jwkKey;

  const jws = await new SignJWT({
    ...payload,
    [namespacedClaim("nonce")]: nonce,
    ...generateRolesFromIds(user.roleIds),
  })
    .setProtectedHeader({
      alg: "ES512",
    })
    .setSubject(user.address)
    .setIssuedAt()
    .setIssuer(TokenModel.JWT_CLAIM_ISSUER)
    .setExpirationTime(Date.now() / 1000 + 60 * 60 * 24 * 7)
    .sign(key);
  return jws;
}

export async function upgradeJwtTokenNewAddress({
  addressesToAdd,
  jwt,
}: {
  jwt: JWTVerifyResult;
  addressesToAdd: { network: "bitcoin" | "ethereum"; address: string }[];
}) {
  const privKey = await jwkKey;

  // links between linked accounts take the form:
  // namespacedClaim(network): address[]

  const newPayload = {
    ...jwt.payload,
    ...addressesToAdd.reduce((acc, { network, address }) => {
      const claim = namespacedClaim(network);
      const existing: string[] = (jwt.payload[claim] as any) ?? [];
      return {
        ...acc,
        [claim]: [...existing, address],
      };
    }, {}),
  };

  const newJws = await new SignJWT(newPayload)
    .setProtectedHeader({
      alg: "ES512",
    })
    .sign(privKey);

  return newJws;
}

export const promisePrivateKey = new Promise<KeyLike>(
  async (resolve, reject) => {
    if ((global as any).promisePrivateKeys) {
      await (global as any).promisePrivateKeys;
    }
    process.env.JWT_PRIVATE_KEY &&
      importPKCS8(process.env.JWT_PRIVATE_KEY, "ECDH-ES+A128KW").then(
        resolve,
        reject,
      );
  },
);

export const jwkKey = new Promise<KeyLike>(async (resolve, reject) => {
  if ((global as any).promisePrivateKeys) {
    await (global as any).promisePrivateKeys;
  }
  process.env.AUTH_MESSAGE_JWK &&
    importJWK(JSON.parse(process.env.AUTH_MESSAGE_JWK), "ECDH-ES+A128KW").then(
      (k: any) => {
        resolve(k);
      },
      reject,
    );
});
