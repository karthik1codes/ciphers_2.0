import { expect } from "chai";
import { ethers } from "hardhat";

describe("RevocationRegistry", function () {
  it("allows owner to revoke credential", async function () {
    const [owner] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("RevocationRegistry");
    const registry = await Registry.deploy(owner.address);
    const credentialId = ethers.keccak256(ethers.toUtf8Bytes("test-credential"));
    await registry.revokeCredential(credentialId);
    expect(await registry.isRevoked(credentialId)).to.equal(true);
  });
});

