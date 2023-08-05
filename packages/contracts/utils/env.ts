function environmentFetcher(envName: string) {
  return (networkName: string): string => {
    networkName = networkName.toUpperCase();
    if (!process.env[`${networkName}_${envName}`] && !process.env[envName]) {
      throw new Error(`Missing ${networkName}_${envName}`);
    }
    return (
      process.env[`${networkName}_${envName}`] ??
      (process.env[envName] as string)
    );
  };
}

export const envRpc = environmentFetcher("RPC");
export const envEtherscanApiKey = environmentFetcher("ETHERSCAN_API_KEY");
export const envSeedPhrase = environmentFetcher("SEED_PHRASE");
