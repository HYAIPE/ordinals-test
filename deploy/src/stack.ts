import * as cdk from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import { fileURLToPath } from "url";

import { InscriptionsBus } from "./inscription-bus.js";
import { Storage } from "./storage.js";
import { DynamoDB } from "./dynamodb.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IProps extends cdk.StackProps {}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    const { ...rest } = props;
    super(scope, id, rest);
    new Storage(this, "Storage", {});
    new DynamoDB(this, "DynamoDB", {});
    new InscriptionsBus(this, "NftMetadataBus", {
      lambdas: false,
    });
  }
}
