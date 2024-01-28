import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {
  Bitcoin,
  BitcoinExeStorage,
  BitcoinStorage,
  ElectrsExeStorage,
  NodeExeStorage,
} from "./bitcoin.js";
import path from "path";
import { fileURLToPath } from "url";
import { MariaDB } from "./mempool/mariadb.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BitcoinExeStackProps extends cdk.StackProps {
  network: "testnet";
  localArchivePath: string;
}

export class BitcoinExeStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { network, localArchivePath, ...props }: BitcoinExeStackProps,
  ) {
    super(scope, id, props);

    const bitcoinExeStorage = new BitcoinExeStorage(this, "BitcoinExeStorage", {
      localArchivePath,
    });

    new cdk.CfnOutput(this, "BitcoinExeBucket", {
      value: bitcoinExeStorage.bitcoinExeAsset.s3BucketName,
    });

    new cdk.CfnOutput(this, "BitcoinExeKey", {
      value: bitcoinExeStorage.bitcoinExeAsset.s3ObjectKey,
    });
  }
}

interface BitcoinProps extends cdk.StackProps {
  localArchivePath: string;
  network: "testnet";
}

export class BitcoinStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { localArchivePath, network, ...props }: BitcoinProps,
  ) {
    super(scope, id, props);

    const bitcoinStorage = new BitcoinStorage(this, "BitcoinStorage");

    const bitcoinExeStorage = new BitcoinExeStorage(this, "BitcoinExeStorage", {
      localArchivePath,
    });

    const electrsExeStorage = new ElectrsExeStorage(this, "ElectrsExeStorage", {
      localArchivePath: path.join(__dirname, "../../electrs/electrs"),
    });

    const nodeExeStorage = new NodeExeStorage(this, "NodeExeStorage", {
      localArchivePath: path.join(
        __dirname,
        "../../bitcoin/node-v20.9.0-linux-arm64.tar.xz",
      ),
    });

    const bitcoin = new Bitcoin(this, "Bitcoin", {
      bitcoinExeAsset: bitcoinExeStorage.bitcoinExeAsset,
      electrsExeAsset: electrsExeStorage.electrsExeAsset,
      nodeExeAsset: nodeExeStorage.nodeExeAsset,
      blockchainDataBucket: bitcoinStorage.blockchainDataBucket,
      network,
    });

    new MariaDB(this, "MariaDb", {
      bitcoinVpc: bitcoin.vpc,
      initialLoad: process.env.INITIAL_LOAD === "true",
    });

    new cdk.CfnOutput(this, "BlockchainDataBucket", {
      value: bitcoinStorage.blockchainDataBucket.bucketName,
    });
  }
}

export class MariaDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, { ...props }: {}) {
    super(scope, id, props);

    const bitcoinVpc =
      (process.env.BITCOIN_VPC_ID &&
        ec2.Vpc.fromLookup(this, "BitcoinVpc", {
          vpcId: process.env.BITCOIN_VPC_ID,
        })) ||
      new ec2.Vpc(this, "BitcoinVpc", {
        maxAzs: 2,
      });
    new MariaDB(this, "MariaDb", {
      bitcoinVpc: bitcoinVpc,
      initialLoad: process.env.INITIAL_LOAD === "true",
    });
  }
}
