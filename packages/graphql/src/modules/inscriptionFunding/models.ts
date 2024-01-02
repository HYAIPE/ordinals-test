import {
  TInscriptionDoc,
  INewFundingAddressModel,
  InscriptionFile,
  IInscriptionDocCommon,
} from "@0xflick/ordinals-models";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { UnableToGetS3ObjectError } from "../../errors/s3.js";
import { toDataURL, QRCodeToDataURLOptions } from "qrcode";

export class InscriptionFundingModel {
  public id: string;
  private readonly fundingAddress: string;
  private document?: TInscriptionDoc;
  private readonly bucket: string;
  private s3Client: S3Client;

  constructor({
    id,
    document,
    fundingAddress,
    bucket,
    s3Client,
  }: {
    id: string;
    document?: TInscriptionDoc;
    fundingAddress: string;
    bucket: string;
    s3Client: S3Client;
  }) {
    this.id = id;
    this.document = document;
    this.fundingAddress = fundingAddress;
    this.bucket = bucket;
    this.s3Client = s3Client;
  }

  public get network() {
    return this.fetchInscription().then((doc) => doc.network);
  }

  public get rootDocumentKey() {
    return `address/${this.fundingAddress}/inscriptions/${this.id}/transaction.json`;
  }
  private _fetchingDocPromise?: Promise<TInscriptionDoc>;
  public async fetchInscription(): Promise<IInscriptionDocCommon> {
    if (this.document) {
      return this.document;
    }
    if (this._fetchingDocPromise) {
      return await this._fetchingDocPromise;
    }
    this._fetchingDocPromise = Promise.resolve().then(async () => {
      const getObjectResponse = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.rootDocumentKey,
        }),
      );
      const data = await getObjectResponse.Body?.transformToString();
      if (!data) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          this.rootDocumentKey,
          "No data returned from S3",
        );
      }
      const mimeType = getObjectResponse.ContentType;

      if (mimeType !== "application/json") {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          this.rootDocumentKey,
          `Invalid mime type ${mimeType}`,
        );
      }
      let document: TInscriptionDoc;
      try {
        document = JSON.parse(data);
      } catch (e) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          await this.rootDocumentKey,
          "Unable to parse JSON",
        );
      }
      return document;
    });
    this.document = await this._fetchingDocPromise;
    return this.document;
  }
  public getInscriptionContentKey(tapKey: string) {
    return `address/${this.fundingAddress}/inscriptions/${this.id}/content/${tapKey}.json`;
  }

  private _inscriptions: Map<string, Promise<InscriptionFile>> = new Map();
  public async fetchInscriptionContent(s3Client: S3Client, tapKey: string) {
    const key = this.getInscriptionContentKey(tapKey);
    if (this._inscriptions.has(key)) {
      return await this._inscriptions.get(key)!;
    }
    const promiseDoc = Promise.resolve().then(async () => {
      const getObjectResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const data = await getObjectResponse.Body?.transformToString();
      if (!data) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          key,
          "No data returned from S3",
        );
      }
      let doc: InscriptionFile;
      try {
        doc = JSON.parse(data);
      } catch (e) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          key,
          "Unable to parse JSON",
        );
      }
      return doc;
    });
    this._inscriptions.set(key, promiseDoc);

    return promiseDoc;
  }

  public async fetchAllInscriptionContent(s3Client: S3Client) {
    const document = await this.fetchInscription();
    const inscriptions = document.writableInscriptions;
    // returns inscriptions in the order they are inscribed
    // Assumes all fetched
    const inscriptionOrder = (): Promise<InscriptionFile>[] => {
      return inscriptions.map(
        (inscription) =>
          this._inscriptions.get(
            this.getInscriptionContentKey(inscription.tapkey),
          )!,
      );
    };
    // full, no need to check for missing
    if (this._inscriptions.size === inscriptions.length) {
      return inscriptionOrder();
    }
    // all existing tap keys
    const existingTapKeys: Map<string, boolean> = [
      ...this._inscriptions.keys(),
    ].reduce((memo, tapKey) => {
      memo.set(tapKey, true);
      return memo;
    }, new Map<string, boolean>());
    const missingTapKeys = inscriptions.filter(
      (inscription) => !existingTapKeys.has(inscription.tapkey),
    );
    await Promise.all(
      missingTapKeys.map(async (inscription) =>
        this.fetchInscriptionContent(s3Client, inscription.tapkey),
      ),
    );
    return inscriptionOrder();
  }

  public get inscriptions() {
    return this.fetchInscription().then((d) => d.writableInscriptions);
  }

  public get qrValue() {
    return this.fundingAmountBtc.then((fundingAmountBtc) => {
      return `bitcoin:${this.fundingAddress}?amount=${fundingAmountBtc}`;
    });
  }

  public get fundingAmountBtc() {
    return this.fetchInscription().then((f) => f.fundingAmountBtc);
  }

  private _qrSrc?: {
    src: Promise<string>;
    memo: string;
  };
  private qrOptionsToMemo(options: QRCodeToDataURLOptions) {
    return JSON.stringify(options);
  }
  public async getQrSrc(options: QRCodeToDataURLOptions) {
    const optionsHash = this.qrOptionsToMemo(options);
    if (!this._qrSrc || optionsHash !== this._qrSrc.memo) {
      this._qrSrc = {
        src: toDataURL(await this.qrValue, options),
        memo: optionsHash,
      };
    }
    return this._qrSrc;
  }

  public get initScript() {
    return this.fetchInscription().then((doc) =>
      doc.initScript.map((script) => {
        if (typeof script === "string") {
          return {
            text: script,
          };
        }

        return {
          base64: script.base64,
        };
      }),
    );
  }

  public get initTapKey() {
    return this.fetchInscription().then((d) => d.initTapKey);
  }

  public get initLeaf() {
    return this.fetchInscription().then((d) => d.initLeaf);
  }

  public get initCBlock() {
    return this.fetchInscription().then((d) => d.initCBlock);
  }

  public get overhead() {
    return this.fetchInscription().then((d) => d.overhead);
  }

  public get privateKey() {
    return this.fetchInscription().then((d) => d.secKey);
  }

  public get padding() {
    return this.fetchInscription().then((d) => d.padding);
  }
}
