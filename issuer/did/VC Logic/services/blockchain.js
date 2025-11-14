/**
 * Blockchain Service for Credential Anchoring
 * 
 * Handles interaction with the CredentialAnchor smart contract on Polygon Mumbai
 */

const { ethers } = require('ethers');

// Contract ABI (minimal interface)
const ANCHOR_ABI = [
  'function anchor(bytes32 credentialHash) external returns (bool)',
  'function isAnchored(bytes32 credentialHash) external view returns (bool)',
  'function getAnchorInfo(bytes32 credentialHash) external view returns (uint256 blockNumber, uint256 timestamp, address issuer)',
  'event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 blockNumber, uint256 timestamp)'
];

/**
 * Get a provider for Polygon Amoy (Mumbai deprecated April 2024)
 */
function getProvider() {
  // Try Amoy first (new testnet), fallback to Mumbai if specified
  const rpcUrl = process.env.AMOY_RPC_URL || 
                 process.env.MUMBAI_RPC_URL || 
                 'https://rpc-amoy.polygon.technology';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get a signer for transactions
 */
function getSigner() {
  const provider = getProvider();
  const privateKey = process.env.ISSUER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('ISSUER_PRIVATE_KEY not set in environment variables');
  }
  
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get the CredentialAnchor contract instance
 */
function getAnchorContract() {
  const contractAddress = process.env.ANCHOR_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error('ANCHOR_CONTRACT_ADDRESS not set in environment variables');
  }
  
  const signer = getSigner();
  return new ethers.Contract(contractAddress, ANCHOR_ABI, signer);
}

/**
 * Compute keccak256 hash of credential ID
 * @param {string} credentialId - The credential ID (e.g., "urn:uuid:...")
 * @returns {string} - The hex-encoded hash
 */
function computeCredentialHash(credentialId) {
  return ethers.keccak256(ethers.toUtf8Bytes(credentialId));
}

/**
 * Anchor a credential hash on-chain
 * @param {string} credentialId - The credential ID to anchor
 * @returns {Promise<{txHash: string, blockNumber: number}>} - Transaction details
 */
async function anchorCredential(credentialId) {
  try {
    const contract = getAnchorContract();
    const credentialHash = computeCredentialHash(credentialId);
    
    console.log(`Anchoring credential hash: ${credentialHash}`);
    console.log(`Credential ID: ${credentialId}`);
    console.log(`Network: Polygon Amoy Testnet`);
    
    // Check if already anchored
    const isAnchored = await contract.isAnchored(credentialHash);
    if (isAnchored) {
      console.log('⚠️  Credential hash already anchored, fetching existing info...');
      const info = await contract.getAnchorInfo(credentialHash);
      const tx = await contract.provider.getTransactionReceipt(credentialHash);
      return {
        txHash: tx?.hash || '0x0',
        blockNumber: Number(info.blockNumber),
        alreadyAnchored: true
      };
    }
    
    // Anchor the credential hash
    const tx = await contract.anchor(credentialHash);
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Credential anchored in block ${receipt.blockNumber}`);
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      alreadyAnchored: false
    };
  } catch (error) {
    console.error('Error anchoring credential:', error);
    throw error;
  }
}

/**
 * Check if a credential hash is anchored
 * @param {string} credentialId - The credential ID to check
 * @returns {Promise<boolean>} - Whether the credential is anchored
 */
async function isCredentialAnchored(credentialId) {
  try {
    const contract = getAnchorContract();
    const credentialHash = computeCredentialHash(credentialId);
    return await contract.isAnchored(credentialHash);
  } catch (error) {
    console.error('Error checking anchor status:', error);
    return false;
  }
}

/**
 * Get anchor information for a credential
 * @param {string} credentialId - The credential ID
 * @returns {Promise<{blockNumber: number, timestamp: number, issuer: string}>} - Anchor info
 */
async function getAnchorInfo(credentialId) {
  try {
    const contract = getAnchorContract();
    const credentialHash = computeCredentialHash(credentialId);
    const info = await contract.getAnchorInfo(credentialHash);
    
    return {
      blockNumber: Number(info.blockNumber),
      timestamp: Number(info.timestamp),
      issuer: info.issuer
    };
  } catch (error) {
    console.error('Error getting anchor info:', error);
    throw error;
  }
}

module.exports = {
  anchorCredential,
  isCredentialAnchored,
  getAnchorInfo,
  computeCredentialHash,
};

