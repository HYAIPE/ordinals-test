/*
 * Defines a stack that accesses the Bitcoin RPC using AWB.
 * Resources:
 *  - User (for signing requests)
 *  - IAM policy for access to AWB
 */
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as asm from "aws-cdk-lib/aws-secretsmanager";

interface BitcoinIamProps {
  mainnet: boolean;
  testnet: boolean;
}

const IAM_ACTION_BITCOIN_MAINNET = "managedblockchain:InvokeRpcBitcoin*";
const IAM_ACTION_BITCOIN_TESTNET = "managedblockchain:InvokeRpcBitcoinTestnet*";

export class BitcoinIam extends Construct {
  readonly user: iam.User;
  readonly secret: asm.Secret;

  constructor(
    scope: Construct,
    id: string,
    { mainnet, testnet }: BitcoinIamProps,
  ) {
    super(scope, id);

    // require at least one of mainnet or testnet
    if (!mainnet && !testnet) {
      throw new Error("must specify at least one of mainnet or testnet");
    }

    const user = new iam.User(this, "User");
    const policy = new iam.Policy(this, "Policy", {
      statements: [
        new iam.PolicyStatement({
          actions: [
            ...(mainnet ? [IAM_ACTION_BITCOIN_MAINNET] : []),
            ...(testnet ? [IAM_ACTION_BITCOIN_TESTNET] : []),
          ],
          resources: ["*"],
        }),
      ],
    });
    policy.attachToUser(user);

    // access key and secret
    const accessKey = new iam.CfnAccessKey(this, "AccessKey", {
      userName: user.userName,
    });

    const secret = new asm.Secret(this, "Secret", {
      description: "Bitcoin Access credentials",
      secretObjectValue: {
        accessKeyId: cdk.SecretValue.unsafePlainText(accessKey.ref),
        secretAccessKey: cdk.SecretValue.unsafePlainText(
          accessKey.attrSecretAccessKey,
        ),
      },
    });

    this.user = user;
    this.secret = secret;
  }
}
