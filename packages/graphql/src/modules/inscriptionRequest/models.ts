import { WritableInscription } from "@0xflick/ordinals-models";
import { InscriptionTransactionContent } from "../../generated-types/graphql.js";

export class InscriptionTransactionContentModel
  implements InscriptionTransactionContent
{
  private readonly inscription: WritableInscription;

  constructor(inscription: WritableInscription) {
    this.inscription = inscription;
  }

  public get cblock() {
    return this.inscription.cblock;
  }

  public get leaf() {
    return this.inscription.leaf;
  }

  public get tapKey() {
    return this.inscription.tapkey;
  }

  public get fee() {
    return this.inscription.fee;
  }

  public get txsize() {
    return this.inscription.txsize;
  }

  public get script() {
    return this.inscription.script.map((script) => {
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
}
