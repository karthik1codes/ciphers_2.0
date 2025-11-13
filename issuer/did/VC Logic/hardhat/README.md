# Smart Contract Revocation Registry (Future Work)

This directory is reserved for future implementation of a smart contract-based revocation registry for Verifiable Credentials.

## Overview

Instead of relying on a centralized storage system for revocation status, a blockchain-based revocation registry would provide:

- **Decentralized revocation status**: No single point of failure
- **Transparency**: All revocation events are publicly verifiable
- **Immutability**: Revocation records cannot be tampered with
- **Trustlessness**: No need to trust a centralized issuer for revocation status

## Architecture

### Smart Contract Design

The revocation registry would be implemented as an Ethereum smart contract (or compatible chain) that stores:

1. **Credential Status Mapping**: Maps credential IDs to their revocation status
2. **Revocation Events**: Timestamped revocation events with optional reasons
3. **Access Controls**: Only authorized issuers can revoke credentials

### Example Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RevocationRegistry {
    // Mapping from credential ID to revocation status
    mapping(bytes32 => bool) public revoked;
    
    // Mapping from credential ID to revocation details
    mapping(bytes32 => RevocationRecord) public revocationRecords;
    
    // Mapping of authorized issuers
    mapping(address => bool) public authorizedIssuers;
    
    struct RevocationRecord {
        bool revoked;
        uint256 revokedAt;
        string reason;
        address revokedBy;
    }
    
    // Events
    event CredentialRevoked(bytes32 indexed credentialId, address indexed revokedBy, string reason);
    event CredentialReactivated(bytes32 indexed credentialId);
    
    // Modifier to check if caller is authorized issuer
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }
    
    // Revoke a credential
    function revokeCredential(bytes32 credentialId, string memory reason) 
        public 
        onlyAuthorizedIssuer 
    {
        revoked[credentialId] = true;
        revocationRecords[credentialId] = RevocationRecord({
            revoked: true,
            revokedAt: block.timestamp,
            reason: reason,
            revokedBy: msg.sender
        });
        
        emit CredentialRevoked(credentialId, msg.sender, reason);
    }
    
    // Check revocation status
    function isRevoked(bytes32 credentialId) public view returns (bool) {
        return revoked[credentialId];
    }
    
    // Get revocation details
    function getRevocationRecord(bytes32 credentialId) 
        public 
        view 
        returns (RevocationRecord memory) 
    {
        return revocationRecords[credentialId];
    }
}
```

## Integration

### Backend Integration

The revocation service would need to:

1. **Deploy contract**: Deploy the revocation registry contract to the blockchain
2. **Register issuer**: Register the issuer's Ethereum address as authorized
3. **Revoke on-chain**: When revoking a credential, call `revokeCredential()` on the contract
4. **Check status**: Query the contract when verifying credentials

### Example Integration Code

```javascript
// utils/blockchain-revocation.js
const { ethers } = require('ethers');
const RevocationRegistryABI = require('./contracts/RevocationRegistry.json');

async function revokeOnChain(credentialId, reason) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contract = new ethers.Contract(
    process.env.REVOCATION_REGISTRY_ADDRESS,
    RevocationRegistryABI,
    wallet
  );
  
  // Hash credential ID to bytes32
  const credentialIdHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(credentialId)
  );
  
  // Revoke on-chain
  const tx = await contract.revokeCredential(credentialIdHash, reason);
  await tx.wait();
  
  return tx.hash;
}

async function checkRevocationStatus(credentialId) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const contract = new ethers.Contract(
    process.env.REVOCATION_REGISTRY_ADDRESS,
    RevocationRegistryABI,
    provider
  );
  
  const credentialIdHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(credentialId)
  );
  
  const isRevoked = await contract.isRevoked(credentialIdHash);
  const record = await contract.getRevocationRecord(credentialIdHash);
  
  return {
    revoked: isRevoked,
    revokedAt: record.revokedAt,
    reason: record.reason,
    revokedBy: record.revokedBy,
  };
}
```

## Implementation Steps

1. **Set up Hardhat**:
   ```bash
   npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
   npx hardhat init
   ```

2. **Write smart contract**:
   - Create `contracts/RevocationRegistry.sol`
   - Add tests in `test/RevocationRegistry.test.js`
   - Compile with `npx hardhat compile`

3. **Deploy contract**:
   - Create deployment script in `scripts/deploy.js`
   - Deploy to testnet (Goerli, Sepolia) or mainnet
   - Save contract address to `.env`

4. **Integrate with backend**:
   - Update `routes/revoke.js` to call smart contract
   - Update `routes/verify.js` to check on-chain status
   - Add fallback to local storage if contract unavailable

5. **Testing**:
   - Test on local Hardhat network
   - Test on testnet
   - Monitor gas costs
   - Optimize contract if needed

## Benefits

- **Decentralization**: No reliance on centralized revocation service
- **Transparency**: All revocation events are on-chain and verifiable
- **Immutable**: Once revoked on-chain, cannot be undone without another transaction
- **Standardization**: Can implement standard revocation registry interfaces (e.g., EIP-5539)

## Considerations

### Gas Costs

- Each revocation requires a blockchain transaction (gas fees)
- Consider batching revocations or using Layer 2 solutions (Polygon, Optimism, Arbitrum)
- For high-volume scenarios, use a hybrid approach (on-chain for critical, off-chain for others)

### Privacy

- Credential IDs stored on-chain are publicly visible
- Consider using hashed credential IDs or zero-knowledge proofs
- Implement access controls for sensitive information

### Performance

- On-chain lookups require RPC calls (slower than local DB)
- Consider caching frequently accessed status
- Use events/indexing for efficient queries

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Developer Resources](https://ethereum.org/en/developers/)
- [W3C Revocation List 2020](https://www.w3.org/TR/vc-status-list-2021/)
- [EIP-5539: Revocation Registry](https://eips.ethereum.org/EIP-5539)

## Status

This is **future work** and not yet implemented. The current implementation uses file-based storage for revocation status.

