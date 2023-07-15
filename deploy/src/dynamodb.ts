import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface IProps {}

export class DynamoDB extends Construct {
  public readonly rbacTable: dynamodb.Table;
  public readonly userNonceTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: IProps) {
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
  }
}
