export interface IObservedClaim {
  contractAddress: `0x${string}`;
  chainId: number;
  claimedAddress: `0x${string}`;
  destinationAddress: string;
  index: number;
  observedBlockHeight: number;
  fundingId?: string;
  collectionId: string;
}

export interface IObservedContract {
  chainId: number;
  contractAddress: `0x${string}`;
}
