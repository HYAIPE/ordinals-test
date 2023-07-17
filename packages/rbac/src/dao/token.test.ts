import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { UserDAO } from "./user.js";
import { createJwtTokenSingleSubject, promisePrivateKey } from "./token.js";
import {
  TokenModel,
  promisePublicKey,
  EActions,
  EResource,
  verifyJwtToken,
} from "@0xflick/ordinals-rbac-models";
import * as jose from "jose";
import { RolePermissionsDAO } from "./rolePermissions.js";
import { RolesDAO } from "./roles.js";
import { UserRolesDAO } from "./userRoles.js";

describe("#Token DAO", () => {
  it("can exchange JWE", async () => {
    const ge = new jose.CompactEncrypt(
      new TextEncoder().encode(
        "It's dangerous to go alone! Take this. Do do do dooooooo",
      ),
    );
    const pubKey = await promisePublicKey;
    const privKey = await promisePrivateKey;

    const jwe = await ge
      .setProtectedHeader({
        kid: "kid",
        alg: "ECDH-ES+A128KW",
        enc: "A128GCM",
        crv: "P-521",
      })
      .encrypt(pubKey);
    expect(jwe).toBeTruthy();

    const jweDec = await jose.compactDecrypt(jwe, privKey);

    // Now create a JWT using the wrapped secret
    const jws = await new jose.SignJWT({
      foo: "bar",
    })
      .setProtectedHeader({
        alg: "ES512",
      })
      .setAudience("0x1234567890123456789012345678901234567890")
      .setIssuedAt()
      .setIssuer(TokenModel.JWT_CLAIM_ISSUER)
      .setSubject("sub")
      .setExpirationTime("12h")
      .sign(privKey);

    // Now verify the JWT
    const jwt = await jose.jwtVerify(jws, pubKey);
  });

  it("can create a JWT token", async () => {
    TokenModel.JWT_CLAIM_ISSUER = "https://example.com";
    const userId = createUuid();
    const db = getDb();
    const dao = new UserDAO(db as any);
    const permissionDao = new RolePermissionsDAO(db as any);
    const rolesDao = new RolesDAO(db as any);

    const roleId = createUuid();
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await permissionDao.bind({
      roleId,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });

    await dao.create({
      address: userId,
      domain: "example.com",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      nonce: "0",
      issuedAt: new Date().toISOString(),
      uri: "https://example.com",
    });
    const userRolesDao = new UserRolesDAO(db as any);
    await userRolesDao.bind({
      address: userId,
      roleId: roleId,
      rolesDao,
    });

    const token = await createJwtTokenSingleSubject({
      user: {
        address: userId,
        roleIds: [roleId],
      },
      nonce: "0",
    });
    expect(token).toBeDefined();
    expect(
      await verifyJwtToken({
        token,
        nonce: "0",
        roleIds: [roleId],
      }),
    ).toEqual(
      expect.objectContaining({
        address: userId,
        roleIds: [roleId],
        nonce: "0",
      }),
    );
  });
});
