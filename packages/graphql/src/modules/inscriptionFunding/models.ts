import {
  TInscriptionDoc,
  INewFundingAddressModel,
  InscriptionFile,
} from "@0xflick/ordinals-models";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { UnableToGetS3ObjectError } from "../../errors/s3.js";
import { toDataURL, QRCodeToDataURLOptions } from "qrcode";

export class InscriptionFundingModel {
  private id: string;
  private document?: TInscriptionDoc;
  private readonly fundingAddressModel: INewFundingAddressModel;
  private readonly bucket: string;

  constructor({
    id,
    fundingAddressModel,
    document,
    bucket,
  }: {
    id: string;
    fundingAddressModel: INewFundingAddressModel;
    document?: TInscriptionDoc;
    bucket: string;
  }) {
    this.id = id;
    this.fundingAddressModel = fundingAddressModel;
    if (document) {
      this.document = document;
    }
    this.bucket = bucket;
  }

  public get fundingAddress() {
    return this.fundingAddressModel.fundingAddress;
  }

  public get network() {
    return this.fundingAddressModel.network;
  }

  public get rootDocumentKey() {
    return `address/${this.fundingAddress}/inscriptions/${this.id}/metadata.json`;
  }
  private _fetchingDocPromise?: Promise<TInscriptionDoc>;
  public async fetchInscriptions(s3Client: S3Client) {
    if (this.document) {
      return;
    }
    if (this._fetchingDocPromise) {
      return this._fetchingDocPromise;
    }
    this._fetchingDocPromise = Promise.resolve().then(async () => {
      const getObjectResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.rootDocumentKey,
        })
      );
      const data = await getObjectResponse.Body?.transformToString();
      if (!data) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          this.rootDocumentKey,
          "No data returned from S3"
        );
      }
      const mimeType = getObjectResponse.ContentType;

      if (mimeType !== "application/json") {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          this.rootDocumentKey,
          `Invalid mime type ${mimeType}`
        );
      }
      let document: TInscriptionDoc;
      try {
        document = JSON.parse(data);
      } catch (e) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          this.rootDocumentKey,
          "Unable to parse JSON"
        );
      }
      return document;
    });
    this.document = await this._fetchingDocPromise;
  }

  private ensureDocument() {
    if (!this.document) {
      throw new Error("Inscriptions not fetched, call fetchInscriptions first");
    }
    return this.document;
  }

  public getInscriptionContentKey(tapKey: string) {
    return `address/${this.fundingAddress}/inscriptions/${this.id}/content/${tapKey}`;
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
        })
      );
      const data = await getObjectResponse.Body?.transformToString();
      if (!data) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          key,
          "No data returned from S3"
        );
      }
      let doc: InscriptionFile;
      try {
        doc = JSON.parse(data);
      } catch (e) {
        throw new UnableToGetS3ObjectError(
          this.bucket,
          key,
          "Unable to parse JSON"
        );
      }
      return doc;
    });
    this._inscriptions.set(key, promiseDoc);

    return promiseDoc;
  }

  public async fetchAllInscriptionContent(s3Client: S3Client) {
    const inscriptions = this.ensureDocument().writableInscriptions;
    // returns inscriptions in the order they are inscribed
    // Assumes all fetched
    const inscriptionOrder = (): Promise<InscriptionFile>[] => {
      return inscriptions.map(
        (inscription) =>
          this._inscriptions.get(
            this.getInscriptionContentKey(inscription.tapKey)
          )!
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
      (inscription) => !existingTapKeys.has(inscription.tapKey)
    );
    await Promise.all(
      missingTapKeys.map(async (inscription) =>
        this.fetchInscriptionContent(s3Client, inscription.tapKey)
      )
    );
    return inscriptionOrder();
  }

  private ensureInscriptions() {
    if (!this._inscriptions) {
      throw new Error(
        "Inscriptions not fetched, call fetchAllInscriptionContent first"
      );
    }
    return this._inscriptions;
  }

  public get files() {
    return this.ensureInscriptions();
  }

  public get inscriptions() {
    return this.ensureDocument().writableInscriptions;
  }

  public get qrValue() {
    return `bitcoin:${this.fundingAddress}?amount=${this.fundingAmountBtc}`;
  }

  public get fundingAmountBtc() {
    return this.ensureDocument().fundingAmountBtc;
  }

  private _qrSrc?: {
    src: Promise<string>;
    memo: string;
  };
  private qrOptionsToMemo(options: QRCodeToDataURLOptions) {
    return JSON.stringify(options);
  }
  public getQrSrc(options: QRCodeToDataURLOptions) {
    const optionsHash = this.qrOptionsToMemo(options);
    if (!this._qrSrc || optionsHash !== this._qrSrc.memo) {
      this._qrSrc = {
        src: toDataURL(this.qrValue, options),
        memo: optionsHash,
      };
    }
    return this._qrSrc;
  }

  public get initScript() {
    return this.ensureDocument().initScript.map((script) => {
      if (typeof script === "string") {
        return {
          text: script,
        };
      }

      return {
        base64: script.base64,
      };
    });
  }

  public get initTapKey() {
    return this.ensureDocument().initTapKey;
  }

  public get initLeaf() {
    return this.ensureDocument().initLeaf;
  }

  public get initCBlock() {
    return this.ensureDocument().initCBlock;
  }

  public get overhead() {
    return this.ensureDocument().overhead;
  }

  public get privateKey() {
    return this.ensureDocument().secKey;
  }

  public get padding() {
    return this.ensureDocument().padding;
  }
}
