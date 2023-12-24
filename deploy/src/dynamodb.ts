import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface IProps {}

export class DynamoDB extends Construct {
  public readonly rbacTable: dynamodb.Table;
  public readonly userNonceTable: dynamodb.Table;
  public readonly fundingTable: dynamodb.Table;
  public readonly claimsTable: dynamodb.Table;
  public readonly openEditionClaimsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, _: IProps) {
    super(scope, id);

    const rbacTable = new dynamodb.Table(this, "RbacTable", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    rbacTable.addGlobalSecondaryIndex({
      indexName: "RolesByNameIndex",
      partitionKey: {
        name: "RoleName",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["RoleID"],
    });
    rbacTable.addGlobalSecondaryIndex({
      indexName: "RoleByActionResourceIndex",
      partitionKey: {
        name: "ResourceType",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "ActionType",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["RoleID", "Identifier"],
    });
    rbacTable.addGlobalSecondaryIndex({
      indexName: "PermissionRoleIDIndex",
      partitionKey: {
        name: "PermissionRoleID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["ActionType", "ResourceType", "Identifier"],
    });
    rbacTable.addGlobalSecondaryIndex({
      indexName: "UserRoleIDIndex",
      partitionKey: {
        name: "UserRoleID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["Address"],
    });
    rbacTable.addGlobalSecondaryIndex({
      indexName: "AddressIndex",
      partitionKey: {
        name: "Address",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["UserRoleID"],
    });
    this.rbacTable = rbacTable;
    new cdk.CfnOutput(this, "RbacTableName", {
      exportName: "RbacTableName",
      value: rbacTable.tableName,
    });

    const userNonceTable = new dynamodb.Table(this, "UserNonce", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "TTL",
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    userNonceTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["Nonce"],
    });
    this.userNonceTable = userNonceTable;
    new cdk.CfnOutput(this, "UserNonceTableName", {
      exportName: "UserNonceTableName",
      value: userNonceTable.tableName,
    });

    const fundingTable = new dynamodb.Table(this, "Funding-4", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    fundingTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    fundingTable.addGlobalSecondaryIndex({
      indexName: "collectionByName",
      partitionKey: {
        name: "collectionName",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["collectionID", "maxSupply", "currentSupply"],
    });
    fundingTable.addGlobalSecondaryIndex({
      indexName: "collectionId-index",
      partitionKey: {
        name: "collectionId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "fundingStatus",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["address", "id", "fundingAmountSat"],
    });
    fundingTable.addGlobalSecondaryIndex({
      indexName: "address-collection-index",
      partitionKey: {
        name: "address",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "collectionId",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    this.fundingTable = fundingTable;
    new cdk.CfnOutput(this, "FundingTableName", {
      exportName: "FundingTableName",
      value: fundingTable.tableName,
    });

    const claimsTable = new dynamodb.Table(this, "Claims", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Not used for now
    // claimsTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "sk",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    claimsTable.addGlobalSecondaryIndex({
      indexName: "ClaimsByAddress",
      partitionKey: {
        name: "ClaimedAddress",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    claimsTable.addGlobalSecondaryIndex({
      indexName: "ClaimsByCollectionAddress",
      partitionKey: {
        name: "ClaimedAddressCollection",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    claimsTable.addGlobalSecondaryIndex({
      indexName: "ObservedBlockHeight-index",
      partitionKey: {
        name: "ObservedBlockHeight",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    claimsTable.addGlobalSecondaryIndex({
      indexName: "ClaimsByCollection",
      partitionKey: {
        name: "CollectionId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.claimsTable = claimsTable;
    new cdk.CfnOutput(this, "ClaimsTableName", {
      exportName: "ClaimsTableName",
      value: claimsTable.tableName,
    });

    const openEditionClaimsTable = new dynamodb.Table(
      this,
      "OpenEditionClaims",
      {
        partitionKey: {
          name: "pk",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "sk",
          type: dynamodb.AttributeType.STRING,
        },
        tableClass: dynamodb.TableClass.STANDARD,
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      },
    );

    openEditionClaimsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "gsi1pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.openEditionClaimsTable = openEditionClaimsTable;
    new cdk.CfnOutput(this, "OpenEditionClaimsTableName", {
      exportName: "OpenEditionClaimsTableName",
      value: openEditionClaimsTable.tableName,
    });
  }
}
