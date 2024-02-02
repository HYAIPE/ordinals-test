import { v4 as uuid } from "uuid";
import { CollectionsModule } from "./generated-types/module-types.js";
import { CollectionError } from "./errors.js";
import { ID_Collection, toCollectionId } from "@0xflick/ordinals-models";
import { CollectionModel } from "./models.js";
import { verifyAuthorizedUser } from "../auth/controller.js";
import {
  EActions,
  EResource,
  defaultAdminStrategyAll,
  isActionOnResource,
} from "@0xflick/ordinals-rbac-models";
import { DISALLOWED_META_KEYS } from "@0xflick/ordinals-backend";
import { createLogger } from "@0xflick/ordinals-backend";

const logger = createLogger({ name: "graphql/collections" });

const canPerformCreateCollection = defaultAdminStrategyAll(
  EResource.COLLECTION,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.COLLECTION,
  }),
);
const canPerformUpdateCollection = defaultAdminStrategyAll(
  EResource.COLLECTION,
  isActionOnResource({
    action: EActions.UPDATE,
    resource: EResource.COLLECTION,
  }),
);
const canPerformDeleteCollection = defaultAdminStrategyAll(
  EResource.COLLECTION,
  isActionOnResource({
    action: EActions.DELETE,
    resource: EResource.COLLECTION,
  }),
);
export const resolvers: CollectionsModule.Resolvers = {
  Mutation: {
    createCollection: async (
      _parent,
      { input: { name, maxSupply, meta } },
      context,
      info,
    ) => {
      const { fundingDao, requireMutation } = context;
      requireMutation(info);
      await verifyAuthorizedUser(context, canPerformCreateCollection);
      const collections = await fundingDao.getCollectionByName(name);
      if (collections.length > 0) {
        throw new CollectionError("COLLECTION_ALREADY_EXISTS", name);
      }
      let metadata: Record<string, unknown> = {};
      try {
        if (meta) {
          metadata = JSON.parse(meta);
        }
      } catch (e) {
        logger.warn({ meta }, "Unable to parse metadata");
        throw new CollectionError(
          "INVALID_METADATA",
          "Unable to parse metadata",
        );
      }

      for (const key of Object.keys(metadata)) {
        // disallow reservered names for metadata
        if (DISALLOWED_META_KEYS.includes(key)) {
          throw new CollectionError("INVALID_METADATA", `Reserved key: ${key}`);
        }
        // only strings are allowed for metadata
        if (typeof metadata[key] !== "string") {
          throw new CollectionError(
            "INVALID_METADATA",
            `key: ${key} is not a string`,
          );
        }
      }

      const id = uuid();
      const model = {
        id: toCollectionId(id),
        name,
        totalCount: 0,
        maxSupply,
        meta: metadata,
      };
      await fundingDao.createCollection(model);
      return new CollectionModel(model);
    },
    deleteCollection: async (_parent, { id }, context, info) => {
      const { fundingDao, requireMutation } = context;
      await verifyAuthorizedUser(context, canPerformDeleteCollection);
      requireMutation(info);
      await fundingDao.deleteCollection(id as ID_Collection);
      return true;
    },
    collection: async (_parent, { id }, context) => {
      const { fundingDao } = context;
      const model = await fundingDao.getCollection(id as ID_Collection);
      if (!model) {
        throw new CollectionError("COLLECTION_NOT_FOUND", id);
      }
      return new CollectionModel(model);
    },
  },
  Query: {
    collections: async (_parent, _args, context) => {
      const { fundingDao } = context;
      const models = await fundingDao.getAllCollections();
      return models.map((model) => new CollectionModel(model));
    },
    collection: async (_parent, { id }, context) => {
      const { fundingDao } = context;
      const model = await fundingDao.getCollection(id as ID_Collection);
      if (!model) {
        throw new CollectionError("COLLECTION_NOT_FOUND", id);
      }
      return new CollectionModel(model);
    },
  },
  Collection: {
    metadata: (parent) => {
      return Object.entries(parent.meta).map(([key, value]) => ({
        key,
        value: value.toString(),
      }));
    },
    updateMetadata: async (parent, { metadata }, context, info) => {
      const { fundingDao, requireMutation } = context;
      requireMutation(info);
      await verifyAuthorizedUser(context, canPerformUpdateCollection);
      const model = await fundingDao.updateCollectionMeta(
        parent.id,
        metadata.reduce(
          (acc, { key, value }) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
      return new CollectionModel(model);
    },
  },
};
