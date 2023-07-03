import { BitcoinNetworkNames } from "./bitcoin";
import { Address } from "@cmdcode/tapscript";
import { ID_Collection } from "./collection";
export type ID_AddressInscription = string & { __id_addressInscription: never };

export function toAddressInscriptionId(id: string): ID_AddressInscription {
  return id as ID_AddressInscription;
}

export interface IAddressInscriptionModel {
  address: string;
  network: BitcoinNetworkNames;
  id: ID_AddressInscription;
  collectionId: ID_Collection;
  contentIds: string[];
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

export class AddressInscriptionModel implements IAddressInscriptionModel {
  public address: string;
  public network: BitcoinNetworkNames;
  public collectionId: ID_Collection;
  public contentIds: string[];

  constructor(item: Omit<IAddressInscriptionModel, "id"> & { id?: string }) {
    this.address = item.address;
    this.network = item.network;
    this.contentIds = item.contentIds;
    if (item.id) {
      this._id = toAddressInscriptionId(item.id);
    }
    this.collectionId = item.collectionId;
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
