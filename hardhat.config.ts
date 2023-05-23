import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const COINMARKETCAP = process.env.COINMARKET_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    artifacts: './src/artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-reporter.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP,
    token: "MATIC",
  }
};

export default config;
