/**
 * Storage Utility Functions
 * 
 * Simple file-based storage for verifiable credentials
 * 
 * Features:
 * - Save credentials to JSON file
 * - Retrieve credentials by ID
 * - List all credentials
 * - Mark credentials as revoked
 * 
 * PRODUCTION NOTES:
 * - Replace with a proper database (PostgreSQL, MongoDB, etc.)
 * - Add encryption at rest
 * - Implement proper locking for concurrent access
 * - Add indexing for fast queries
 * - Implement audit logging
 * - Add access controls
 * 
 * Current implementation is lock-free and suitable for demo/hackathon use
 */

const fs = require('fs');
const path = require('path');

// Storage file path
const STORAGE_DIR = path.join(__dirname, '..', 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'credentials.json');

/**
 * Ensure storage directory and file exist
 */
function ensureStorage() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log(`Created storage directory: ${STORAGE_DIR}`);
  }
  
  // Create storage file if it doesn't exist
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2));
    console.log(`Created storage file: ${STORAGE_FILE}`);
  }
}

/**
 * Read all credentials from storage
 * 
 * @returns {Array<object>} - Array of credential records
 */
function readCredentials() {
  try {
    ensureStorage();
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading credentials:', error);
    // Return empty array if file is corrupted or missing
    return [];
  }
}

/**
 * Write credentials to storage
 * 
 * @param {Array<object>} credentials - Array of credential records to write
 */
function writeCredentials(credentials) {
  try {
    ensureStorage();
    
    // Write to file atomically (in a single operation)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(credentials, null, 2));
  } catch (error) {
    console.error('Error writing credentials:', error);
    throw new Error(`Failed to write credentials: ${error.message}`);
  }
}

/**
 * Save a credential record
 * 
 * If a credential with the same ID exists, it will be updated.
 * Otherwise, a new credential will be added.
 * 
 * @param {object} credentialRecord - Credential record to save
 * @returns {object} - Saved credential record
 */
function saveCredential(credentialRecord) {
  try {
    const credentials = readCredentials();
    
    // Find index of existing credential with same ID
    const index = credentials.findIndex(c => c.id === credentialRecord.id);
    
    if (index >= 0) {
      // Update existing credential
      credentials[index] = {
        ...credentials[index],
        ...credentialRecord,
        updatedAt: new Date().toISOString(),
      };
      console.log(`Updated credential: ${credentialRecord.id}`);
    } else {
      // Add new credential
      credentials.push({
        ...credentialRecord,
        createdAt: new Date().toISOString(),
      });
      console.log(`Saved new credential: ${credentialRecord.id}`);
    }
    
    writeCredentials(credentials);
    return credentials[index >= 0 ? index : credentials.length - 1];
  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
}

/**
 * Get a credential by ID
 * 
 * @param {string} credentialId - Credential ID to look up
 * @returns {object|null} - Credential record or null if not found
 */
function getCredentialById(credentialId) {
  try {
    const credentials = readCredentials();
    
    // Find credential by ID
    // Support both full URI format and UUID format
    const credential = credentials.find(c => 
      c.id === credentialId || 
      c.id === `urn:uuid:${credentialId}` ||
      c.id?.endsWith(credentialId)
    );
    
    return credential || null;
  } catch (error) {
    console.error('Error getting credential:', error);
    return null;
  }
}

/**
 * List all credentials
 * 
 * @param {object} filters - Optional filters (e.g., { holderDid, type, revoked })
 * @returns {Array<object>} - Array of credential records
 */
function listCredentials(filters = {}) {
  try {
    let credentials = readCredentials();
    
    // Apply filters
    if (filters.holderDid) {
      credentials = credentials.filter(c => c.holderDid === filters.holderDid);
    }
    
    if (filters.type) {
      credentials = credentials.filter(c => c.type === filters.type);
    }
    
    if (filters.revoked !== undefined) {
      credentials = credentials.filter(c => c.revoked === filters.revoked);
    }
    
    return credentials;
  } catch (error) {
    console.error('Error listing credentials:', error);
    return [];
  }
}

/**
 * Mark a credential as revoked
 * 
 * @param {string} credentialId - Credential ID to revoke
 * @param {string} reason - Optional revocation reason
 * @returns {object} - Updated credential record
 */
function markRevoked(credentialId, reason = null) {
  try {
    const credentials = readCredentials();
    
    // Find credential
    const index = credentials.findIndex(c => 
      c.id === credentialId || 
      c.id === `urn:uuid:${credentialId}` ||
      c.id?.endsWith(credentialId)
    );
    
    if (index === -1) {
      throw new Error(`Credential not found: ${credentialId}`);
    }
    
    // Mark as revoked
    credentials[index].revoked = true;
    credentials[index].revokedAt = new Date().toISOString();
    credentials[index].revocationReason = reason || 'No reason provided';
    credentials[index].updatedAt = new Date().toISOString();
    
    writeCredentials(credentials);
    
    console.log(`Marked credential as revoked: ${credentialId}`);
    return credentials[index];
  } catch (error) {
    console.error('Error revoking credential:', error);
    throw error;
  }
}

/**
 * Get revocation status
 * 
 * @param {string} credentialId - Credential ID to check
 * @returns {object} - Status object { revoked: boolean, revokedAt?, reason? }
 */
function getRevocationStatus(credentialId) {
  try {
    const credential = getCredentialById(credentialId);
    
    if (!credential) {
      return { revoked: false, error: 'Credential not found' };
    }
    
    return {
      revoked: credential.revoked || false,
      revokedAt: credential.revokedAt || null,
      reason: credential.revocationReason || null,
    };
  } catch (error) {
    console.error('Error getting revocation status:', error);
    return { revoked: false, error: error.message };
  }
}

module.exports = {
  saveCredential,
  getCredentialById,
  listCredentials,
  markRevoked,
  getRevocationStatus,
  readCredentials, // Export for testing
};

