import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type {
  InscriptionFile,
  InscriptionId,
  TInscriptionDoc,
} from "@0xflick/ordinals-models";
import type { IFundingDocDao } from "../dao/index.js";

export class FundingDocDao implements IFundingDocDao {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(s3Client: S3Client, bucket: string) {
    this.s3Client = s3Client;
    this.bucket = bucket;
  }
  public transactionKey({
    fundingAddress,
    id,
  }: Parameters<IFundingDocDao["transactionKey"]>[0]) {
    return `address/${fundingAddress}/inscriptions/${id}/transaction.json`;
  }
  public transactionContentKey({ id, tapKey, fundingAddress }: InscriptionId) {
    return `address/${fundingAddress}/inscriptions/${id}/content/${tapKey}.json`;
  }
  public async updateOrSaveInscriptionTransaction(item: TInscriptionDoc) {
    const { fundingAddress } = item;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.transactionKey({
          fundingAddress,
          id: item.id,
        }),
        Body: JSON.stringify(item),
        ContentType: "application/json",
      })
    );
  }

  public async saveInscriptionContent(item: InscriptionFile): Promise<void> {
    const { id } = item;
    if (!id) {
      throw new Error("id required");
    }
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.transactionContentKey(id),
        Body: JSON.stringify(item),
        ContentType: "application/json",
      })
    );
  }

  async getInscriptionContent(id: InscriptionId): Promise<InscriptionFile> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.transactionContentKey(id),
      })
    );
    if (!response.Body) {
      throw new Error("No body returned from S3");
    }
    const data = await response.Body.transformToString();
    return JSON.parse(data);
  }

  async getInscriptionTransaction(
    request: Parameters<IFundingDocDao["getInscriptionTransaction"]>[0]
  ): Promise<TInscriptionDoc> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.transactionKey(request),
      })
    );
    if (!response.Body) {
      throw new Error("No body returned from S3");
    }
    const data = await response.Body.transformToString();
    return JSON.parse(data);
  }
}
