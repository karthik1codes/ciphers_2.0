import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Registry = await ethers.getContractFactory("RevocationRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();

  console.log("RevocationRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

