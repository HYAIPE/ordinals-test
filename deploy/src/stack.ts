import * as cdk from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import { fileURLToPath } from "url";

import { InscriptionsBus } from "./inscription-bus.js";
import { Storage } from "./storage.js";
import { DynamoDB } from "./dynamodb.js";
import { Www } from "./distribution.js";
import { Graphql } from "./graphql.js";
import { Frame } from "./frame.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IProps extends cdk.StackProps {}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    const { ...rest } = props;
    super(scope, id, rest);
    const { inscriptionBucket } = new Storage(this, "Storage", {});
    const {
      claimsTable,
      fundingTable,
      openEditionClaimsTable,
      rbacTable,
      userNonceTable,
    } = new DynamoDB(this, "DynamoDB", {});
    // new InscriptionsBus(this, "NftMetadataBus", {
    //   lambdas: false,
    // });

    const { api: graphqlApi } = new Graphql(this, "Graphql", {
      domainName: "bitflick.xyz",
      claimsTable,
      fundingTable,
      openEditionClaimsTable,
      rbacTable,
      userNonceTable,
      inscriptionBucket,
    });
    const graphqlApiUrl = cdk.Fn.select(
      1,
      cdk.Fn.split("//", graphqlApi.apiEndpoint),
    );
    new cdk.CfnOutput(this, "GraphqlApiUrl", {
      value: graphqlApiUrl,
    });

    new Www(this, "Www", {
      // Adding cert manually because cloudflare
      noCert: true,
      domain: "www.bitflick.xyz",
      graphqlApi,
    });
  }
}

export class FrameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);
    new Frame(this, "Frame", {
      imageDomainName: "frame.bitflick.xyz",
    });
  }
}
