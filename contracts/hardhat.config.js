import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY || "";
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];
const isEmpty = (v) => !v || v === "";

/** @type import("hardhat/config").HardhatUserConfig */
export default {
  solidity: {
    version: process.env.SOLIDITY_VERSION || "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    // Mantle Mainnet (optional — only defined if MANTLE_RPC_URL is set)
    ...(!isEmpty(process.env.MANTLE_RPC_URL)
      ? {
          mantle: {
            url: process.env.MANTLE_RPC_URL,
            accounts,
            chainId: Number(process.env.MANTLE_CHAIN_ID || "5000"),
          },
        }
      : {}),
    // Mantle Sepolia Testnet
    mantle_sepolia: {
      url: process.env.MANTLE_TESTNET_RPC_URL || "https://rpc.sepolia.mantle.xyz",
      accounts,
      chainId: Number(process.env.MANTLE_TESTNET_CHAIN_ID || "5003"),
    },
    // Legacy alias for `npm run deploy:testnet`
    ...(!isEmpty(process.env.MANTLE_TESTNET_RPC_URL)
      ? {
          mantle_testnet: {
            url: process.env.MANTLE_TESTNET_RPC_URL,
            accounts,
            chainId: Number(process.env.MANTLE_TESTNET_CHAIN_ID || "5003"),
          },
        }
      : {}),
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.MANTLESCAN_API_KEY || "",
    customChains: [
      // Mantle Mainnet (optional)
      ...(!isEmpty(process.env.MANTLE_RPC_URL)
        ? [
            {
              network: "mantle",
              chainId: Number(process.env.MANTLE_CHAIN_ID || "5000"),
              urls: {
                apiURL:
                  process.env.MANTLESCAN_API_URL ||
                  "https://api.mantlescan.xyz/api",
                browserURL:
                  process.env.MANTLESCAN_BROWSER_URL ||
                  "https://mantlescan.xyz",
              },
            },
          ]
        : []),
      // Mantle Sepolia
      {
        network: "mantleSepolia",
        chainId: Number(process.env.MANTLE_TESTNET_CHAIN_ID || "5003"),
        urls: {
          apiURL:
            process.env.MANTLESCAN_TESTNET_API_URL ||
            "https://api-sepolia.mantlescan.xyz/api",
          browserURL:
            process.env.MANTLESCAN_TESTNET_BROWSER_URL ||
            "https://sepolia.mantlescan.xyz",
        },
      },
      {
        network: "mantleTestnet",
        chainId: Number(process.env.MANTLE_TESTNET_CHAIN_ID || "5003"),
        urls: {
          apiURL:
            process.env.MANTLESCAN_TESTNET_API_URL ||
            "https://api-sepolia.mantlescan.xyz/api",
          browserURL:
            process.env.MANTLESCAN_TESTNET_BROWSER_URL ||
            "https://sepolia.mantlescan.xyz",
        },
      },
    ],
  },
};
