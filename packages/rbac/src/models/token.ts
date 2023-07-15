import { CompactEncrypt, decodeJwt, importSPKI } from "jose";
import { IRole } from "./roles.js";
import { promisePublicKey, UserWithRolesModel } from "./user.js";

export function generateRoles(roles: IRole[]) {
  return generateRolesFromIds(roles.map((role) => role.id));
}

export function namespacedClaim(claim: string) {
  return `${
    TokenModel.JWT_CLAIM_ISSUER ? `${TokenModel.JWT_CLAIM_ISSUER}/` : ""
  }${claim}`;
}

export function generateRolesFromIds(roles?: string[]) {
  return roles?.length
    ? roles.reduce(
        (memo, role) => {
          memo[namespacedClaim(`role/${role}`)] = true;
          return memo;
        },
        {} as Record<string, boolean>,
      )
    : {};
}

export function decodeJwtToken(token: string): null | UserWithRolesModel {
  const result = decodeJwt(token);
  if (result.iss !== TokenModel.JWT_CLAIM_ISSUER) {
    return null;
  }
  const roleNamespace = namespacedClaim("role/");
  const roleIds = Object.entries(result)
    .filter(([k, v]) => v && k.includes(roleNamespace))
    .map(([k]) => k.replace(roleNamespace, ""));
  return UserWithRolesModel.fromJson({
    address: result.sub,
    roleIds,
  });
}

export async function createJweRequest({
  signature,
  nonce,
  pubKeyStr,
}: {
  signature: string;
  nonce: string;
  pubKeyStr?: string;
}) {
  const ge = new CompactEncrypt(new TextEncoder().encode(signature));
  const pubKey = pubKeyStr
    ? await importSPKI(pubKeyStr, "ECDH-ES+A128KW", {
        extractable: true,
      })
    : await promisePublicKey;
  const jwe = await ge
    .setProtectedHeader({
      kid: nonce,
      alg: "ECDH-ES+A128KW",
      enc: "A128GCM",
      crv: "P-521",
    })
    .encrypt(pubKey);
  return jwe;
}

export class TokenModel {
  public static JWT_CLAIM_ISSUER =
    process.env.AUTH_MESSAGE_JWT_CLAIM_ISSUER ?? "dapp";
}
