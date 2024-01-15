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
  createLogger,
} from "@0xflick/ordinals-backend";
import handlebars from "handlebars";
import { minify } from "html-minifier-terser";
import { MempoolModel } from "../bitcoin/models.js";
import { estimateFeesWithMempool } from "../bitcoin/fees.js";
import {
  AxolotlProblem,
  FeeLevel,
  InputMaybe,
} from "../../generated-types/graphql.js";
import { bitcoinToSats, satsToBitcoin } from "@0xflick/inscriptions";
import { AxolotlError } from "./errors.js";

const { compile } = handlebars;

const logger = createLogger({ name: "graphql/axolotl/models" });

export interface IAxolotlMeta {
  tokenIds: number[];
  revealedAt: number;
  // claimIndex?: number;
  // claimAddress?: string;
  claimedCount: number;
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
  public readonly problems?: AxolotlProblem[];
  constructor({
    inscriptionDocument,
    inscriptionFunding,
    inscriptionTransaction,
    addressInscription,
    problems,
  }: {
    inscriptionFunding: InscriptionFundingModel;
    inscriptionTransaction: InscriptionTransactionModel;
    inscriptionDocument: TInscriptionDoc;
    addressInscription: AddressInscriptionModel<IAxolotlMeta>;
    problems?: AxolotlProblem[];
  }) {
    this.inscriptionFunding = inscriptionFunding;
    this.inscriptionTransaction = inscriptionTransaction;
    this.inscriptionDocument = inscriptionDocument;
    this.addressInscription = addressInscription;
    this.problems = problems;
  }

  public get id() {
    return this.addressInscription.id;
  }

  public get tokenIds() {
    return this.addressInscription.meta.tokenIds;
  }

  public get revealedAt() {
    return this.addressInscription.meta.revealedAt;
  }

  public get claimedCount() {
    return this.addressInscription.meta.claimedCount;
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

  public static async estimateFees({
    mempool,
    feePerByte,
    feeLevel,
    count,
    tipPerToken,
  }: {
    count: number;
    feePerByte?: InputMaybe<number>;
    feeLevel?: InputMaybe<FeeLevel>;
    mempool: MempoolModel;
    tipPerToken: number;
  }) {
    const feeRate = await estimateFeesWithMempool({
      mempoolBitcoinClient: mempool,
      feePerByte,
      feeLevel,
    });
    const inscriptionContents: InscriptionContent[] = [];
    const htmlContent = await AxolotlModel.promiseMinifiedHtml({
      genesis: false,
      scriptUrl:
        "/content/349873249857324985723948572394875324985732948573249857",
      tokenId: 100,
      revealedAt: 1111111,
    });
    const inscriptionContent: InscriptionContent = {
      content: Buffer.from(htmlContent, "utf8"),
      mimeType: "text/html",
      compress: true,
      metadata: {
        tokenId: 100,
        revealedAt: 1111111,
      },
    };
    for (let i = 0; i < count; i++) {
      inscriptionContents.push(inscriptionContent);
    }

    const { fundingAmountBtc, totalFee } = await createInscriptionTransaction({
      address: "tb1pm0r7x8q0rl8tmz8mcv0ezxsv7en3qk7a0ksvj2mf5r8rw2aaflmqr78439",
      feeRate,
      network: "testnet",
      tip: tipPerToken * count,
      inscriptions: inscriptionContents,
    });
    const totalInscriptionSats = Number(bitcoinToSats(fundingAmountBtc));
    return {
      tipPerTokenSats: tipPerToken,
      tipPerTokenBtc: satsToBitcoin(BigInt(tipPerToken)),
      totalInscriptionSats,
      totalInscriptionBtc: fundingAmountBtc,
      totalFeeSats: totalFee,
      totalFeeBtc: satsToBitcoin(BigInt(totalFee)),
      feePerByte: feeRate,
    };
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
    tipDestination,
    s3Client,
    count,
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
    tipDestination: string;
    s3Client: S3Client;
    count: number;
  }) {
    const collection = await incrementingRevealDao.getCollection(collectionId);

    if (!collection) {
      throw new AxolotlError(
        `No collection with id ${collectionId}`,
        "NO_COLLECTION_FOUND",
      );
    }

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

    const problems: AxolotlProblem[] = [];

    const inscriptionContents: InscriptionContent[] = [];
    const tokenIds: number[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const tokenId =
          await incrementingRevealDao.incrementCollectionTotalCount(
            collectionId,
          );
        tokenIds.push(tokenId);
        const htmlContent = await AxolotlModel.promiseMinifiedHtml({
          genesis: false,
          scriptUrl,
          tokenId,
          revealedAt,
        });
        const inscriptionContent: InscriptionContent = {
          content: Buffer.from(htmlContent, "utf8"),
          mimeType: "text/html",
          compress: true,
          metadata: {
            tokenId,
            revealedAt,
          },
        };
        inscriptionContents.push(inscriptionContent);
      } catch (e) {
        logger.error(e, "Failed to create inscription content");
        // We go ahead and continue, since this probably happened because we hit the max supply
        problems.push({
          code: "UNABLE_TO_CLAIM",
          message: "Unable to claim",
        });
      }
    }

    if (inscriptionContents.length === 0) {
      throw new AxolotlError(
        `No inscriptions created`,
        "UNABLE_TO_CLAIM_ANY_MORE",
      );
    }

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
      tip: tip * inscriptionContents.length,
      inscriptions: inscriptionContents,
    });

    const addressModel = new AddressInscriptionModel<IAxolotlMeta>({
      collectionId,
      address: fundingAddress,
      destinationAddress,
      network,
      contentIds: writableInscriptions.map((inscription) => inscription.tapkey),
      fundingStatus: "funding",
      timesChecked: 0,
      fundingAmountBtc,
      fundingAmountSat: Number(bitcoinToSats(fundingAmountBtc)),
      tipAmountSat: tip * inscriptionContents.length,
      tipAmountDestination: tipDestination,
      meta: {
        tokenIds,
        claimedCount: count,
        revealedAt,
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
      problems,
    });
  }
}
