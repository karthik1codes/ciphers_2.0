import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.ISSUER_PRIVATE_KEY ? [process.env.ISSUER_PRIVATE_KEY] : []
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.ISSUER_PRIVATE_KEY ? [process.env.ISSUER_PRIVATE_KEY] : [],
      chainId: 80002
    },
    // Mumbai is deprecated (April 2024) - use Amoy instead
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-amoy.polygon.technology", // Fallback to Amoy
      accounts: process.env.ISSUER_PRIVATE_KEY ? [process.env.ISSUER_PRIVATE_KEY] : [],
      chainId: 80002 // Using Amoy chain ID
    }
  }
};

export default config;

