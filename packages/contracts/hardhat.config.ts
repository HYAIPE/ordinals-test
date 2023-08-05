import fs from "fs";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "hardhat-deploy";
// import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "dotenv/config";
import { envSeedPhrase, envEtherscanApiKey, envRpc } from "./utils/env";
import { HardhatUserConfig, task } from "hardhat/config";

task("verify:test", async (args, { deployments, run }) => {
  const test = await deployments.get("TestAllowance");
  await run("verify:verify", {
    address: test.address,
    constructorArguments: test.args,
  });
});

export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20000,
      },
    },
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    sepolia: {
      url: envRpc("sepolia"),
      accounts: {
        mnemonic: envSeedPhrase("sepolia"),
      },
    },
    goerli: {
      url: envRpc("goerli"),
      accounts: {
        mnemonic: envSeedPhrase("goerli"),
      },
    },
    mainnet: {
      url: envRpc("mainnet"),
      accounts: {
        mnemonic: envSeedPhrase("mainnet"),
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: envEtherscanApiKey("mainnet"),
      goerli: envEtherscanApiKey("goerli"),
      sepolia: envEtherscanApiKey("sepolia"),
    },
  },
} as HardhatUserConfig;
