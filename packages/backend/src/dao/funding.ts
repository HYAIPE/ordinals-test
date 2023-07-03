import {
  IAddressInscriptionModel,
  TInscriptionDoc,
  InscriptionFile,
} from "@0xflick/ordinals-models";

export interface IFundingDao {
  createFunding(item: IAddressInscriptionModel): Promise<void>;
  getFunding(id: string): Promise<IAddressInscriptionModel>;
  deleteFunding(id: string): Promise<void>;
}

export interface IFundingDocDao {
  transactionKey(opts: { address: string; id: string; tapKey: string }): string;
  updateOrSaveInscriptionTransaction(item: TInscriptionDoc): Promise<void>;
  saveInscriptionContent(item: InscriptionFile): Promise<void>;
  getInscriptionContent(tapKey: string): Promise<InscriptionFile>;
  getInscriptionTransaction(id: string): Promise<TInscriptionDoc>;
}
