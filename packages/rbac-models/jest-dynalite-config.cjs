module.exports = {
  tables: [
    {
      TableName: "UserNonce",
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
      AttributeDefinitions: [{
        AttributeName: "pk",
        AttributeType: "S"
      }, {
        AttributeName: "sk",
        AttributeType: "S",
      }, {
        AttributeName: "TTL",
        AttributeType: "N"
      }],
      BillingMode: "PAY_PER_REQUEST",
      timeToLiveAttribute: "TTL",
      GlobalSecondaryIndexes: [{
        IndexName: "GSI1",
        KeySchema: [{
          AttributeName: "sk",
          KeyType: "HASH",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["Nonce"],
        },
      }]
    },
    {
      TableName: "RBAC",
      KeySchema: [{
        AttributeName: "pk",
        KeyType: "HASH",
      }],
      AttributeDefinitions: [{
        AttributeName: "pk",
        AttributeType: "S",
      }, {
        AttributeName: "Address",
        AttributeType: "S",
      }, {
        AttributeName: "RoleID",
        AttributeType: "S",
      }, {
        AttributeName: "PermissionRoleID",
        AttributeType: "S",
      }, {
        AttributeName: "UserRoleID",
        AttributeType: "S",
      }, {
        AttributeName: "RoleName",
        AttributeType: "S",
      }, {
        AttributeName: "CreatedAt",
        AttributeType: "N",
      }, {
        AttributeName: "ResourceType",
        AttributeType: "S",
      }, {
        AttributeName: "ActionType",
        AttributeType: "S",
      }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: "RolesByNameIndex",
        KeySchema: [{
          AttributeName: "RoleName",
          KeyType: "HASH",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["RoleID"],
        },
      }, {
        IndexName: "RoleByActionResourceIndex",
        KeySchema: [{
          AttributeName: "ResourceType",
          KeyType: "HASH",
        }, {
          AttributeName: "ActionType",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["RoleID", "Identifier"],
        },
      }, {
        IndexName: "PermissionRoleIDIndex",
        KeySchema: [{
          AttributeName: "PermissionRoleID",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["ActionType", "ResourceType", "Identifier"],
        },
      }, {
        IndexName: "UserRoleIDIndex",
        KeySchema: [{
          AttributeName: "UserRoleID",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["Address"],
        },
      }, {
        IndexName: "AddressIndex",
        KeySchema: [{
          AttributeName: "Address",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["UserRoleID"],
        },
      }],
    }],
};
