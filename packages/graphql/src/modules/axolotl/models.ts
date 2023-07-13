import {
  TInscriptionDoc,
  IOrdinalIncrementingRevealModel,
  ID_AddressInscription,
  BitcoinNetworkNames,
  ID_Collection,
  InscriptionContent,
} from "@0xflick/ordinals-models";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import {
  IFundingDao,
  IFundingDocDao,
  IncrementingRevealDao,
  createDynamoDbFundingDao,
} from "@0xflick/ordinals-backend";
import handlebars from "handlebars";
import { minify } from "html-minifier-terser";
import { MempoolModel } from "../bitcoin/models.js";

const { compile } = handlebars;

export interface IAxolotlInput {
  genesis: boolean;
  revealedAt: number;
}

export interface IAxolotlCollectionConfigNetwork {
  scriptName: string;
  revealBlockDelta: number;
}

export type TAxolotlCollectionConfig = Record<
  BitcoinNetworkNames,
  IAxolotlCollectionConfigNetwork | undefined
>;

export interface IAxolotlCollectionIncrementalRevealMeta
  extends IOrdinalIncrementingRevealModel {
  config?: string;
}

export type TAxolotlFundingDao = IFundingDao<
  IAxolotlInput,
  IAxolotlInput,
  void,
  IAxolotlCollectionIncrementalRevealMeta,
  IAxolotlCollectionIncrementalRevealMeta,
  void
>;

export class AxolotlModel {
  // just needs to be unique
  public static ID = "277fcc72-ea5c-4c55-b273-e623db668949" as ID_Collection;

  public static NAME = "Axolotl";

  public static MAX_SUPPLY = 10000;

  public inscriptionFunding?: InscriptionFundingModel;
  public inscriptionTransaction?: InscriptionTransactionModel;
  public inscriptionDocument?: TInscriptionDoc;

  private fundingDocDao: IFundingDocDao;
  private incrementingRevealDao: TAxolotlFundingDao;
  public readonly id: ID_AddressInscription;
  public readonly fundingAddress: string;
  public readonly bucket;

  constructor({
    id,
    bucket,
    fundingAddress,
    fundingDocDao,
    incrementingRevealDao,
  }: {
    id: ID_AddressInscription;
    bucket: string;
    fundingAddress: string;
    fundingDocDao: IFundingDocDao;
    incrementingRevealDao: TAxolotlFundingDao;
  }) {
    this.fundingDocDao = fundingDocDao;
    this.bucket = bucket;
    this.id = id;
    this.fundingAddress = fundingAddress;
    this.incrementingRevealDao = incrementingRevealDao;
  }

  private _promisingInscriptionFunding?: Promise<InscriptionFundingModel>;
  public promiseInscriptionFunding() {
    if (!this._promisingInscriptionFunding) {
      this._promisingInscriptionFunding = Promise.resolve(
        this.promiseInscriptionDocument()
      )
        .then(
          (document) =>
            new InscriptionFundingModel({
              bucket: this.bucket,
              id: this.id,
              document,
            })
        )
        .then((inscriptionFunding) => {
          this.inscriptionFunding = inscriptionFunding;
          return inscriptionFunding;
        });
    }
    return this._promisingInscriptionFunding;
  }

  private _promisingInscriptionTransaction?: Promise<InscriptionTransactionModel>;
  public promiseInscriptionTransaction() {
    if (!this._promisingInscriptionTransaction) {
      this._promisingInscriptionTransaction = this.promiseInscriptionFunding()
        .then(
          (inscriptionFunding) =>
            new InscriptionTransactionModel(inscriptionFunding)
        )
        .then((inscriptionTransaction) => {
          this.inscriptionTransaction = inscriptionTransaction;
          return inscriptionTransaction;
        });
    }
    return this._promisingInscriptionTransaction;
  }

  private _promisingInscriptionDocument?: Promise<TInscriptionDoc>;
  public promiseInscriptionDocument() {
    if (!this._promisingInscriptionDocument) {
      this._promisingInscriptionDocument = this.fundingDocDao
        .getInscriptionTransaction({
          id: this.id,
          fundingAddress: this.fundingAddress,
        })
        .then((inscriptionDocument) => {
          this.inscriptionDocument = inscriptionDocument;
          return inscriptionDocument;
        });
    }
    return this._promisingInscriptionDocument;
  }

  private _promiseConfig?: Promise<TAxolotlCollectionConfig>;
  async config(): Promise<TAxolotlCollectionConfig> {
    if (!this._promiseConfig) {
      this._promiseConfig = this.incrementingRevealDao
        .getCollection(AxolotlModel.ID)
        .then((collection) => {
          const config = collection.meta?.config;
          if (!config) {
            return {
              mainnet: undefined,
              regtest: undefined,
              testnet: undefined,
            };
          }
          return JSON.parse(config);
        });
    }
    return this._promiseConfig;
  }

  public static htmlTemplate() {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    background-color: #ffffff;
                }
                #main {
                    width: 560px;
                    height: 560px;
                }
            </style>
        </head>
        <body>
            <canvas id="main" width="569" height="569"></canvas>
            <script type="text/javascript">
              window.tokenId = {{ tokenId }};
              window.genesis = {{ genesis }};
              window.revealedAt = {{ revealedAt }};
            </script>
            <script src="{{ scriptUrl }}" type="text/javascript"></script>
        </body>
    </html>
  `;
  }
  static async promiseMinifiedHtml({
    scriptUrl,
    tokenId,
    genesis,
    revealedAt,
  }: {
    scriptUrl: string;
    tokenId: number;
    genesis: boolean;
    revealedAt: number;
  }) {
    const template = compile(AxolotlModel.htmlTemplate());

    const renderedHtml = template({
      scriptUrl,
      tokenId,
      genesis,
      revealedAt,
    });

    return await minify(renderedHtml, {
      minifyCSS: true,
      minifyJS: true,
      collapseWhitespace: true,
      removeComments: true,
    });
  }

  public static createDefaultIncrementingRevealDao(): TAxolotlFundingDao {
    const dao = createDynamoDbFundingDao<
      IAxolotlInput,
      IAxolotlInput,
      void,
      IAxolotlCollectionIncrementalRevealMeta,
      IAxolotlCollectionIncrementalRevealMeta,
      void
    >({
      collectionFundingUpdater(item) {
        return item;
      },
      itemFundingUpdater(item) {
        return item;
      },
    });
    return dao;
  }

  public static async create({
    incrementingRevealDao,
    network,
    mempool,
  }: {
    incrementingRevealDao: TAxolotlFundingDao;
    network: BitcoinNetworkNames;
    mempool: MempoolModel;
  }) {
    const collection = await incrementingRevealDao.getCollection(
      AxolotlModel.ID
    );
    const { config: configStr } = collection.meta ?? {};
    const config: TAxolotlCollectionConfig =
      typeof configStr === "undefined"
        ? {
            mainnet: undefined,
            regtest: undefined,
            testnet: undefined,
          }
        : JSON.parse(configStr);

    const configNetwork = config[network];
    if (!configNetwork) {
      throw new Error(`No config for network ${network}`);
    }
    const scriptUrl = configNetwork.scriptName;
    const revealBlockDelta = configNetwork.revealBlockDelta;
    const tipHeight = await mempool.tipHeight();
    const revealedAt = tipHeight + revealBlockDelta;

    const { tokenId } = await incrementingRevealDao.nextTokenId();
    const htmlContent = await AxolotlModel.promiseMinifiedHtml({
      genesis: false,
      scriptUrl,
      tokenId,
      revealedAt,
    });
    const inscriptionContent: InscriptionContent = {
      content: Buffer.from(htmlContent, "utf8"),
      mimeType: "text/html",
    };
  }
}
