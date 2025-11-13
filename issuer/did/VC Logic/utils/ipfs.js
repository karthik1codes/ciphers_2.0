/**
 * IPFS Utility Functions
 * 
 * Handles uploading verifiable credentials to IPFS (InterPlanetary File System)
 * 
 * Features:
 * - Upload credentials to IPFS
 * - Retry logic with exponential backoff
 * - Error handling
 * - Returns CID (Content Identifier)
 * 
 * PRODUCTION NOTES:
 * - Use a reliable IPFS service (Infura, Pinata, or your own node)
 * - Implement pinning for long-term storage
 * - Add encryption before uploading sensitive data
 * - Consider IPNS (InterPlanetary Name System) for mutable content
 */

const { create } = require('ipfs-http-client');
const fs = require('fs').promises;

// Maximum retry attempts
const MAX_RETRIES = 3;
// Base delay between retries (milliseconds)
const RETRY_DELAY = 1000;

/**
 * Get IPFS client instance
 * 
 * Uses IPFS_API from environment or defaults to local node
 */
function getIpfsClient() {
  try {
    // Get IPFS API endpoint from environment
    const ipfsApi = process.env.IPFS_API || '/ip4/127.0.0.1/tcp/5001';
    
    // Create IPFS client
    // Supports various formats: string (URL), object (config), or Multiaddr
    const ipfs = create(ipfsApi);
    
    return ipfs;
  } catch (error) {
    console.error('Failed to create IPFS client:', error);
    throw new Error(`IPFS client initialization failed: ${error.message}`);
  }
}

/**
 * Upload data to IPFS with retry logic
 * 
 * @param {object} data - Data to upload (will be JSON stringified)
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<string>} - IPFS CID (Content Identifier)
 */
async function uploadToIPFS(data, retryCount = 0) {
  try {
    const ipfs = getIpfsClient();
    
    // Convert data to JSON string, then to buffer
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString);
    
    console.log(`Uploading to IPFS (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    
    // Add to IPFS
    const result = await ipfs.add(buffer, {
      pin: true, // Pin the content to prevent garbage collection
      cidVersion: 1, // Use CIDv1 (more future-proof)
    });
    
    // Extract CID
    const cid = result.cid.toString();
    
    console.log(`✅ Successfully uploaded to IPFS: ${cid}`);
    return cid;
  } catch (error) {
    console.error(`IPFS upload attempt ${retryCount + 1} failed:`, error.message);
    
    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return uploadToIPFS(data, retryCount + 1);
    } else {
      // All retries exhausted
      console.error('❌ IPFS upload failed after all retries');
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }
}

/**
 * Fetch data from IPFS by CID
 * 
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<object>} - Parsed JSON data
 */
async function fetchFromIPFS(cid) {
  try {
    const ipfs = getIpfsClient();
    
    console.log(`Fetching from IPFS: ${cid}...`);
    
    // Fetch from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    
    // Concatenate chunks and parse JSON
    const buffer = Buffer.concat(chunks);
    const data = JSON.parse(buffer.toString());
    
    console.log(`✅ Successfully fetched from IPFS: ${cid}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch from IPFS (CID: ${cid}):`, error.message);
    throw new Error(`IPFS fetch failed: ${error.message}`);
  }
}

/**
 * Check if IPFS is available
 * 
 * @returns {Promise<boolean>} - True if IPFS is reachable
 */
async function checkIpfsAvailability() {
  try {
    const ipfs = getIpfsClient();
    // Try to get IPFS ID as a health check
    await ipfs.id();
    return true;
  } catch (error) {
    console.warn('IPFS is not available:', error.message);
    return false;
  }
}

module.exports = {
  uploadToIPFS,
  fetchFromIPFS,
  checkIpfsAvailability,
};

