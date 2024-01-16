import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import {
  Bitcoin,
  BitcoinExeStorage,
  BitcoinStorage,
  ElectrsExeStorage,
  NodeExeStorage,
} from "./bitcoin.js";
import path from "path";
import { fileURLToPath } from "url";

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

    new Bitcoin(this, "Bitcoin", {
      bitcoinExeAsset: bitcoinExeStorage.bitcoinExeAsset,
      electrsExeAsset: electrsExeStorage.electrsExeAsset,
      nodeExeAsset: nodeExeStorage.nodeExeAsset,
      blockchainDataBucket: bitcoinStorage.blockchainDataBucket,
      network,
    });

    new cdk.CfnOutput(this, "BlockchainDataBucket", {
      value: bitcoinStorage.blockchainDataBucket.bucketName,
    });
  }
}
