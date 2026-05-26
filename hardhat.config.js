require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Čita iz .env fajla - NIKAD ne stavljaj private key direktno u kod!
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Lokalna Hardhat mreža - automatski se pokreće za testove
    // Kao H2 in-memory baza za Spring testove
    hardhat: {
      chainId: 31337,
    },

    // Lokalni node - za ručno testiranje (npm run node)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // Sepolia testnet - prava test mreža
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },

  // Etherscan verifikacija kontrakta (opciono, ali korisno)
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  // Folder gde se čuvaju kompajlirani ABI i bytecode
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
