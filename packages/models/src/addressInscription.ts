import { BitcoinNetworkNames } from "./bitcoin.js";
import { Address } from "@0xflick/tapscript";
import { ID_Collection } from "./collection.js";
export type ID_AddressInscription = string & { __id_addressInscription: never };

export function toAddressInscriptionId(id: string): ID_AddressInscription {
  return id as ID_AddressInscription;
}

export interface IAddressInscriptionModel<T = Record<string, any>> {
  address: string;
  network: BitcoinNetworkNames;
  id: ID_AddressInscription;
  collectionId?: ID_Collection;
  contentIds: string[];
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
  public meta: T;

  constructor(item: Omit<IAddressInscriptionModel<T>, "id"> & { id?: string }) {
    this.address = item.address;
    this.network = item.network;
    this.contentIds = item.contentIds;
    if (item.id) {
      this._id = toAddressInscriptionId(item.id);
    }
    this.collectionId = item.collectionId;
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
