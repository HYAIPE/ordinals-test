import { S3Client } from "@aws-sdk/client-s3";
import {
  TInscriptionDoc,
  BitcoinNetworkNames,
  ID_Collection,
  InscriptionContent,
  AddressInscriptionModel,
} from "@0xflick/ordinals-models";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import { InscriptionTransactionModel } from "../inscriptionTransaction/models.js";
import {
  IFundingDao,
  IFundingDocDao,
  createDynamoDbFundingDao,
  createInscriptionTransaction,
} from "@0xflick/ordinals-backend";
import handlebars from "handlebars";
import { minify } from "html-minifier-terser";
import { MempoolModel } from "../bitcoin/models.js";
import { estimateFeesWithMempool } from "../bitcoin/fees.js";
import { FeeLevel, InputMaybe } from "../../generated-types/graphql.js";
import { bitcoinToSats } from "@0xflick/inscriptions";

const { compile } = handlebars;

export interface IAxolotlMeta {
  tokenId: number;
  chameleon: boolean;
  revealedAt: number;
  claimIndex?: number;
  claimAddress?: string;
}

export interface IAxolotlCollectionConfigNetwork {
  scriptName: string;
  revealBlockDelta: number;
}

export type TAxolotlCollectionConfig = Record<
  BitcoinNetworkNames,
  IAxolotlCollectionConfigNetwork | undefined
>;

export interface IAxolotlCollectionIncrementalRevealMeta {
  config?: string;
}

export type TAxolotlFundingDao = IFundingDao<
  IAxolotlMeta,
  IAxolotlCollectionIncrementalRevealMeta
>;

export class AxolotlModel implements IAxolotlMeta {
  public static NAME = "Axolotl";

  public static MAX_SUPPLY = 10000;

  public readonly inscriptionFunding: InscriptionFundingModel;
  public readonly inscriptionTransaction: InscriptionTransactionModel;
  public readonly inscriptionDocument: TInscriptionDoc;
  public readonly addressInscription: AddressInscriptionModel<IAxolotlMeta>;

  constructor({
    inscriptionDocument,
    inscriptionFunding,
    inscriptionTransaction,
    addressInscription,
  }: {
    inscriptionFunding: InscriptionFundingModel;
    inscriptionTransaction: InscriptionTransactionModel;
    inscriptionDocument: TInscriptionDoc;
    addressInscription: AddressInscriptionModel<IAxolotlMeta>;
  }) {
    this.inscriptionFunding = inscriptionFunding;
    this.inscriptionTransaction = inscriptionTransaction;
    this.inscriptionDocument = inscriptionDocument;
    this.addressInscription = addressInscription;
  }

  public get id() {
    return this.addressInscription.id;
  }

  public get tokenId() {
    return this.addressInscription.meta.tokenId;
  }

  public get chameleon() {
    return this.addressInscription.meta.chameleon;
  }

  public get revealedAt() {
    return this.addressInscription.meta.revealedAt;
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
      IAxolotlMeta,
      IAxolotlCollectionIncrementalRevealMeta
    >();
    return dao;
  }

  public static async create({
    collectionId,
    incrementingRevealDao,
    fundingDocDao,
    destinationAddress,
    network,
    mempool,
    feePerByte,
    inscriptionBucket,
    feeLevel,
    tip,
    claimAddress,
    claimIndex,
    s3Client,
  }: {
    collectionId: ID_Collection;
    incrementingRevealDao: TAxolotlFundingDao;
    fundingDocDao: IFundingDocDao;
    destinationAddress: string;
    network: BitcoinNetworkNames;
    mempool: MempoolModel;
    feePerByte?: InputMaybe<number>;
    feeLevel?: InputMaybe<FeeLevel>;
    inscriptionBucket: string;
    tip: number;
    claimAddress?: string;
    claimIndex?: number;
    s3Client: S3Client;
  }) {
    const collection = await incrementingRevealDao.getCollection(collectionId);
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

    const tokenId = await incrementingRevealDao.incrementCollectionTotalCount(
      collectionId,
    );
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
    const finalFee = await estimateFeesWithMempool({
      mempoolBitcoinClient: mempool,
      feePerByte,
      feeLevel,
    });

    const {
      fundingAddress,
      fundingAmountBtc,
      initCBlock,
      initLeaf,
      initScript,
      initTapKey,
      overhead,
      padding,
      secKey,
      totalFee,
      writableInscriptions,
    } = await createInscriptionTransaction({
      address: destinationAddress,
      feeRate: finalFee,
      network,
      tip,
      inscriptions: [inscriptionContent],
    });

    console.log({ secKey }, "Created inscription transaction");

    const addressModel = new AddressInscriptionModel<IAxolotlMeta>({
      collectionId,
      address: fundingAddress,
      network,
      contentIds: writableInscriptions.map((inscription) => inscription.tapkey),
      fundingStatus: "funding",
      timesChecked: 0,
      fundingAmountBtc,
      fundingAmountSat: Number(bitcoinToSats(fundingAmountBtc)),
      meta: {
        chameleon: false,
        revealedAt,
        tokenId,
        claimAddress,
        claimIndex,
      },
    });
    const doc: TInscriptionDoc = {
      id: addressModel.id,
      fundingAddress,
      fundingAmountBtc,
      initCBlock,
      initLeaf,
      initScript,
      initTapKey,
      network,
      overhead,
      padding,
      secKey,
      totalFee,
      writableInscriptions,
      tip,
    };
    const inscriptionFundingModel = new InscriptionFundingModel({
      id: addressModel.id,
      bucket: inscriptionBucket,
      document: doc,
      fundingAddress,
      s3Client,
    });
    await Promise.all([
      fundingDocDao.updateOrSaveInscriptionTransaction(doc),
      incrementingRevealDao.createFunding(addressModel),
      ...writableInscriptions.map((f) =>
        fundingDocDao.saveInscriptionContent({
          id: {
            fundingAddress,
            id: addressModel.id,
            tapKey: f.tapkey,
          },
          content: f.file!.content,
          mimetype: f.file!.mimetype,
        }),
      ),
    ]);

    const inscriptionTransactionModel = new InscriptionTransactionModel(
      inscriptionFundingModel,
    );

    return new AxolotlModel({
      inscriptionDocument: doc,
      inscriptionFunding: inscriptionFundingModel,
      inscriptionTransaction: inscriptionTransactionModel,
      addressInscription: addressModel,
    });
  }
}
