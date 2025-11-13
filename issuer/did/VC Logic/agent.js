/**
 * Veramo Agent Configuration
 * 
 * This module sets up the Veramo agent with:
 * - Key Management System (KMS) - in-memory for demo, replaceable for production
 * - DID providers (did:key and did:ethr)
 * - Credential signing and verification capabilities
 * 
 * PRODUCTION NOTES:
 * - Replace in-memory KMS with AWS KMS, HashiCorp Vault, or HSM
 * - Configure proper Ethereum RPC endpoints for did:ethr
 * - Store private keys securely (never in code or .env)
 */

const { createAgent } = require('@veramo/core');
const { KeyManager } = require('@veramo/key-manager');
const { KeyManagementSystem, SecretBox } = require('@veramo/kms-local');
const { DIDManager } = require('@veramo/did-manager');
const { EthrDIDProvider } = require('@veramo/did-provider-ethr');
const { KeyDIDProvider } = require('@veramo/did-provider-key');
const { CredentialIssuerLD } = require('@veramo/credential-ld');
const { CredentialPlugin } = require('@veramo/credential-w3c');
const { KeyStore, DIDStore, PrivateKeyStore } = require('@veramo/data-store');

// For demo: in-memory key storage with a secret key
// PRODUCTION: Use proper secret management (AWS Secrets Manager, Vault, etc.)
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';

// Initialize agent instance (will be set in initializeAgent)
let agent = null;

/**
 * Initialize the Veramo agent with all required plugins
 */
async function initializeAgent() {
  if (agent) {
    return agent; // Already initialized
  }

  try {
    // Configure KMS (Key Management System)
    // PRODUCTION: Replace with AWS KMS, HashiCorp Vault, Azure Key Vault, or HSM
    // Example AWS KMS: import { KeyManagementSystem } from '@veramo/kms-aws'
    const kms = {
      local: new KeyManagementSystem({
        store: new PrivateKeyStore(new SecretBox(DB_ENCRYPTION_KEY)),
      }),
    };

    // Configure DID providers
    // did:key - simple, works offline (default for demo)
    const keyDidProvider = new KeyDIDProvider({
      defaultKms: 'local',
    });

    // did:ethr - Ethereum-based DIDs (requires RPC endpoint)
    // Uncomment and configure for Ethereum-based DIDs:
    /*
    const ethrDidProvider = new EthrDIDProvider({
      defaultKms: 'local',
      network: process.env.ETHEREUM_NETWORK || 'mainnet',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
      // For development/Goerli:
      // network: 'goerli',
      // rpcUrl: process.env.HARDHAT_RPC_URL || 'http://localhost:8545',
    });
    */

    // Create agent configuration
    const agentConfig = {
      plugins: [
        // Key Manager - handles key operations
        new KeyManager({
          store: new KeyStore(),
          kms,
        }),
        
        // DID Manager - creates and resolves DIDs
        new DIDManager({
          store: new DIDStore(),
          defaultProvider: 'did:key',
          providers: {
            'did:key': keyDidProvider,
            // 'did:ethr': ethrDidProvider, // Uncomment if using did:ethr
          },
        }),
        
        // Credential Issuer - issues W3C Verifiable Credentials
        new CredentialPlugin(),
        
        // Credential Issuer LD - for JSON-LD credentials (optional)
        // Uncomment if you need JSON-LD format:
        // new CredentialIssuerLD({
        //   contextMaps: [],
        //   suites: [],
        // }),
      ],
    };

    // Create agent instance
    agent = createAgent(agentConfig);
    
    console.log('Veramo agent created with:');
    console.log('  - Key Management System: local (in-memory)');
    console.log('  - DID Providers: did:key');
    console.log('  - Credential formats: JWT (W3C)');
    
    return agent;
  } catch (error) {
    console.error('Failed to initialize Veramo agent:', error);
    throw error;
  }
}

/**
 * Get the initialized agent instance
 */
function getAgent() {
  if (!agent) {
    throw new Error('Agent not initialized. Call initializeAgent() first.');
  }
  return agent;
}

module.exports = {
  initializeAgent,
  getAgent,
};

