import { BitcoinNetworkNames } from "./bitcoin.js";
import { Address } from "@0xflick/tapscript";
import { ID_Collection } from "./collection.js";
export type ID_AddressInscription = string & { __id_addressInscription: never };

export function toAddressInscriptionId(id: string): ID_AddressInscription {
  return id as ID_AddressInscription;
}

export type TFundingStatus = "funding" | "funded" | "genesis" | "reveal";

export interface IAddressInscriptionModel<T = Record<string, any>> {
  address: string;
  network: BitcoinNetworkNames;
  id: ID_AddressInscription;
  collectionId?: ID_Collection;
  contentIds: string[];
  fundingTxid?: string;
  fundingVout?: number;
  revealTxid?: string;
  genesisTxid?: string;
  fundingStatus: TFundingStatus;
  lastChecked?: Date;
  timesChecked: number;
  fundingAmountBtc: string;
  fundingAmountSat: number;
  meta: T;
}

function xor(buf1: Uint8Array, buf2: Uint8Array) {
  return buf1.map((b, i) => b ^ buf2[i]);
}

export function hashInscriptions(address: string, tapKeys: string[]) {
  return Buffer.from(
    [Address.decode(address).data, ...tapKeys].reduce(
      (memo, tapKey) => xor(Buffer.from(tapKey, "hex"), memo),
      new Uint8Array(32)
    )
  ).toString("hex");
}

export class AddressInscriptionModel<T extends Record<string, any> = {}>
  implements IAddressInscriptionModel<T>
{
  public address: string;
  public network: BitcoinNetworkNames;
  public collectionId?: ID_Collection;
  public contentIds: string[];
  public fundingTxid?: string;
  public fundingVout?: number;
  public revealTxid?: string;
  public genesisTxid?: string;
  public fundingStatus: TFundingStatus;
  public lastChecked?: Date;
  public timesChecked: number;
  public fundingAmountBtc: string;
  public fundingAmountSat: number;
  public meta: T;

  constructor(item: Omit<IAddressInscriptionModel<T>, "id"> & { id?: string }) {
    this.address = item.address;
    this.network = item.network;
    this.contentIds = item.contentIds;
    if (item.id) {
      this._id = toAddressInscriptionId(item.id);
    }
    this.collectionId = item.collectionId;
    this.fundingTxid = item.fundingTxid;
    this.fundingVout = item.fundingVout;
    this.revealTxid = item.revealTxid;
    this.genesisTxid = item.genesisTxid;
    this.fundingStatus = item.fundingStatus;
    this.lastChecked = item.lastChecked;
    this.timesChecked = item.timesChecked;
    this.fundingAmountBtc = item.fundingAmountBtc;
    this.fundingAmountSat = item.fundingAmountSat;
    this.meta = item.meta;
  }

  private _id?: ID_AddressInscription;
  public get id(): ID_AddressInscription {
    if (!this._id) {
      this._id = toAddressInscriptionId(
        hashInscriptions(this.address, this.contentIds)
      );
    }
    return this._id;
  }
}
