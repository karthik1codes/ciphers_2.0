import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CredentialAnchor with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
  const anchor = await CredentialAnchor.deploy();
  await anchor.waitForDeployment();

  const address = await anchor.getAddress();
  console.log("✅ CredentialAnchor deployed to:", address);
  console.log("\n📋 Contract Details:");
  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 80002n ? "Polygon Amoy" : network.chainId === 80001n ? "Polygon Mumbai (Deprecated)" : "Unknown";
  console.log(`  Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log("  Address:", address);
  console.log("  Deployer:", deployer.address);
  console.log("\n💡 Save this address to your .env file as ANCHOR_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

