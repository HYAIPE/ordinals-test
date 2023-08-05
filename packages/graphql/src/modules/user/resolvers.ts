import {
  BitcoinNetworkNames,
  authMessageBitcoin,
  authMessageEthereum,
} from "@0xflick/ordinals-models";
import { createLogger } from "@0xflick/ordinals-backend";
import { Address } from "@0xflick/tapscript";
import { RoleModel } from "../permissions/models.js";
import { UserModule } from "./generated-types/module-types.js";
import { modelPermissionToGraphql } from "../permissions/transforms.js";
import { keccak256, toUtf8Bytes } from "ethers";

const logger = createLogger({
  name: "graphql/user-resolvers",
});

export function addressToBitcoinNetwork(address: string): BitcoinNetworkNames {
  const { network } = Address.decode(address);
  switch (network) {
    case "main":
      return "mainnet";
    case "testnet":
      return "testnet";
    case "regtest":
      return "regtest";
    default:
      throw new Error(`Unknown network ${network}`);
  }
}

export const resolvers: UserModule.Resolvers = {
  Web3User: {
    roles: async (user, _, { userRolesDao, rolesDao, rolePermissionsDao }) => {
      const userRoles = await user.withRoles({ userRolesDao });
      return userRoles.roleIds.map(
        (roleId) => new RoleModel(rolesDao, rolePermissionsDao, roleId),
      );
    },
    allowedActions: async (
      { address },
      _,
      { userRolesDao, rolePermissionsDao, userDao },
    ) => {
      const permissions = await userDao.allowedActionsForAddress(
        userRolesDao,
        rolePermissionsDao,
        address,
      );
      return permissions.map(modelPermissionToGraphql);
    },
  },
  Mutation: {
    nonceEthereum: async (
      _,
      { address, chainId },
      {
        userDao,
        authMessageDomain,
        authMessageExpirationTimeSeconds,
        authMessageJwtClaimIssuer,
      },
    ) => {
      const now = Date.now();
      const expirationTime = new Date(
        now + authMessageExpirationTimeSeconds * 1000,
      ).toISOString();
      const issuedAt = new Date(now).toISOString();
      const nonce = await userDao.create({
        address,
        domain: authMessageDomain,
        expiresAt: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
        chainId,
      });

      const messageToSign = authMessageEthereum({
        address,
        chainId,
        nonce,
        domain: authMessageDomain,
        expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
      });
      console.log(
        "message to sign",
        messageToSign,
        "\n",
        keccak256(toUtf8Bytes(messageToSign)),
      );

      return {
        nonce,
        messageToSign,
        domain: authMessageDomain,
        expiration: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        version: "1",
        chainId,
        pubKey: process.env.AUTH_MESSAGE_PUBLIC_KEY!,
      };
    },
    nonceBitcoin: async (
      _,
      { address },
      {
        userDao,
        authMessageDomain,
        authMessageExpirationTimeSeconds,
        authMessageJwtClaimIssuer,
      },
    ) => {
      const now = Date.now();
      const expirationTime = new Date(
        now + authMessageExpirationTimeSeconds * 1000,
      ).toISOString();
      const issuedAt = new Date(now).toISOString();
      const nonce = await userDao.create({
        address,
        domain: authMessageDomain,
        expiresAt: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
      });

      const messageToSign = authMessageBitcoin({
        address,
        nonce,
        domain: authMessageDomain,
        expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        network: addressToBitcoinNetwork(address),
      });

      return {
        nonce,
        messageToSign,
        domain: authMessageDomain,
        expiration: expirationTime,
        issuedAt,
        uri: authMessageJwtClaimIssuer,
        pubKey: process.env.AUTH_MESSAGE_PUBLIC_KEY!,
      };
    },
  },
};
