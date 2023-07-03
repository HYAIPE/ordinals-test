import { S3Client } from "@aws-sdk/client-s3";
import type { TInscriptionDoc } from "@0xflick/ordinals-models";
import type { IFundingDocDao } from "../dao";

export class FundingDocDao implements IFundingDocDao {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(s3Client: S3Client, bucket: string) {
    this.s3Client = s3Client;
    this.bucket = bucket;
  }
  public transactionKey({
    address,
    id,
    tapKey,
  }: Parameters<IFundingDocDao["transactionKey"]>[0]) {
    return `address/${address}/inscriptions/${id}/content/${tapKey}`;
  }
  public async updateOrSaveInscriptionTransaction(item: TInscriptionDoc) {
    const { fundingAddress } = item;
    try {
      await this.s3Client.putObject({
        Bucket: this.bucket,
        Key: this.transactionKey({
          address,
          id,
          tapKey,
        }),
        Body: JSON.stringify(item),
      });
    }
  }
}
