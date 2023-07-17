import {
  BitcoinNonceMutationOptions,
  useBitcoinNonceMutation,
} from "./nonce.generated";

export function useNonceBitcoin(options?: BitcoinNonceMutationOptions) {
  const [fetch, result] = useBitcoinNonceMutation(options);
  const nonce = result.data?.nonceBitcoin?.nonce;
  const messageToSign = result.data?.nonceBitcoin?.messageToSign;
  const pubKey = result.data?.nonceBitcoin?.pubKey;
  return {
    fetch,
    nonce,
    messageToSign,
    pubKey,
  };
}
