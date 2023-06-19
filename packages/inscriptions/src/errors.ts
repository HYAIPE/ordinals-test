export class RateLimitedError extends Error {}
export class PaddingTooLowError extends Error {
  public minPaddingNeeded: number;

  constructor(paddingGiven: number, minPaddingNeeded: number) {
    super(
      `Padding too low. The minimum padding needed is ${minPaddingNeeded} but only ${paddingGiven} provided.`
    );
    this.minPaddingNeeded = minPaddingNeeded;
  }
}
export class InvalidKeyError extends Error {}
export class InvalidAddressError extends Error {}
