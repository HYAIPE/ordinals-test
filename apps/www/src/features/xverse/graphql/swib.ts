import { useSiwbMutation, SiwbMutationOptions } from "./siwb.generated";

export function useSIWB(options?: SiwbMutationOptions) {
  const [fetch, result] = useSiwbMutation(options);
  const token = result.data?.siwe?.token;
  return {
    fetch,
    token,
  };
}
