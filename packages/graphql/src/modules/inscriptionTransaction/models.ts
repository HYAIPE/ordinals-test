import { InscriptionTransaction } from "../../generated-types/graphql.js";
import { InscriptionFundingModel } from "../inscriptionFunding/models.js";
import { InscriptionTransactionContentModel } from "../inscriptionRequest/models.js";

export class InscriptionTransactionModel implements InscriptionTransaction {
  private readonly inscriptionFunding: InscriptionFundingModel;

  constructor(inscriptionFunding: InscriptionFundingModel) {
    this.inscriptionFunding = inscriptionFunding;
  }

  public get initScript() {
    return this.inscriptionFunding.initScript;
  }

  public get initTapKey() {
    return this.inscriptionFunding.initTapKey;
  }

  public get initCBlock() {
    return this.inscriptionFunding.initCBlock;
  }

  public get initLeaf() {
    return this.inscriptionFunding.initLeaf;
  }

  public get inscriptions(): InscriptionTransactionContentModel[] {
    return this.inscriptionFunding.inscriptions.map(
      (inscription) => new InscriptionTransactionContentModel(inscription),
    );
  }

  public get overhead() {
    return this.inscriptionFunding.overhead;
  }

  public get padding() {
    return this.inscriptionFunding.padding;
  }

  public get privateKey() {
    return this.inscriptionFunding.privateKey;
  }

  public get qrValue() {
    return this.inscriptionFunding.qrValue;
  }

  public get qrSrc() {
    return this.inscriptionFunding.getQrSrc({});
  }
}
