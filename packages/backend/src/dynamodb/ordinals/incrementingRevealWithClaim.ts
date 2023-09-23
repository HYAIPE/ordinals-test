import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ClaimsDao, IFundingDao } from "../../index.js";
import {
  ID_Collection,
  IIncrementingRevealCollectionMeta,
  IIncrementingRevealItemMeta,
  IObservedClaim,
  InscriptionContent,
} from "@0xflick/ordinals-models";
import { readIAllowance } from "../../wagmi/generated.js";

export type InscriptionDecoratorFn<ItemMeta> = (
  claims: {
    observedClaim: IObservedClaim;
    nextTokenId: number;
  }[]
) => Promise<{
  inscriptions: InscriptionContent[];
  itemMeta: ItemMeta;
}>;

export class IncrementingRevealWithClaimDao<
  ItemMeta extends Record<string, any> = {},
  CollectionMeta extends Record<string, any> = {}
> {
  private readonly fundingDao: IFundingDao<
    Omit<ItemMeta, keyof IIncrementingRevealItemMeta> &
      IIncrementingRevealItemMeta,
    Omit<CollectionMeta, keyof IIncrementingRevealCollectionMeta> &
      IIncrementingRevealCollectionMeta
  >;
  private readonly claimsDao: ClaimsDao;

  private readonly collectionId: ID_Collection;

  constructor({
    claimsDao,
    collectionId,
    fundingDao,
  }: {
    claimsDao: ClaimsDao;
    collectionId: ID_Collection;
    fundingDao: IFundingDao<any, any>;
  }) {
    this.claimsDao = claimsDao;
    this.collectionId = collectionId;
    this.fundingDao = fundingDao;
  }

  async nextTokenId(): Promise<number> {
    const collection = await this.fundingDao.getCollection(this.collectionId);
    return collection.totalCount + 1;
  }

  async isValidClaimInDB({
    observedClaim: {
      chainId,
      claimedAddress,
      contractAddress,
      destinationAddress,
      index,
    },
  }: {
    observedClaim: IObservedClaim;
  }): Promise<boolean> {
    const item = await this.claimsDao.get({
      contractAddress,
      chainId,
      claimedAddress,
      destinationAddress,
      index,
    });
    return item !== undefined;
  }

  async isValidClaimInContract({
    observedClaim: {
      chainId,
      claimedAddress,
      contractAddress,
      destinationAddress,
      index,
    },
  }: {
    observedClaim: IObservedClaim;
  }): Promise<boolean> {
    const destinationAddressFromChain = await readIAllowance({
      chainId,
      address: contractAddress,
      functionName: "claimable",
      args: [claimedAddress, BigInt(index)],
    });
    return destinationAddressFromChain === destinationAddress;
  }

  async assertValidClaim({
    observedClaim,
  }: {
    observedClaim: IObservedClaim;
  }): Promise<void> {
    await Promise.all([
      Promise.resolve().then(async () => {
        const result = await this.isValidClaimInDB({
          observedClaim,
        });
        if (!result) {
          throw new Error("Claim is not valid in DB");
        }
      }),
      Promise.resolve().then(async () => {
        const result = await this.isValidClaimInContract({
          observedClaim,
        });
        if (!result) {
          throw new Error("Claim is not valid in contract");
        }
      }),
    ]);
  }

  // async inscriptionsForClaims({
  //   observedClaims,
  //   inscriptor,
  // }: {
  //   observedClaims: IObservedClaim[];
  //   inscriptor: InscriptionDecoratorFn<
  //     Omit<ItemMeta, keyof IIncrementingRevealItemMeta> &
  //       IIncrementingRevealItemMeta
  //   >;
  // }) {
  //   const nextTokenId = await this.fundingDao.incrementCollectionTotalCount(
  //     this.collectionId
  //   );
  //   // We try very hard to fail after this point and save this inscription
  //   const { inscriptions, itemMeta } = await inscriptor(
  //     await Promise.all(
  //       observedClaims.map(async (observedClaim) => {
  //         const nextTokenId =
  //           await this.fundingDao.incrementCollectionTotalCount(
  //             this.collectionId
  //           );
  //         return {
  //           observedClaim,
  //           nextTokenId,
  //         };
  //       })
  //     )
  //   );
  // }
}
