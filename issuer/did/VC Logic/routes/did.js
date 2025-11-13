/**
 * DID Generation Route
 * 
 * POST /generate-did
 * Creates a new DID (Decentralized Identifier) using Veramo
 * 
 * Optional request body: { seed: "optional-seed-string" }
 * Returns: { did, keys, message }
 */

const express = require('express');
const router = express.Router();
const agent = require('../agent');

/**
 * Generate a new DID
 * 
 * This creates a DID using the did:key method (default)
 * For production, you might want to use did:ethr or other methods
 */
router.post('/', async (req, res, next) => {
  try {
    const { seed } = req.body || {};
    const veramoAgent = agent.getAgent();
    
    console.log('Generating new DID...');
    
    // Create a new DID using Veramo
    // For did:key, this generates a new Ed25519 key pair
    const identifier = await veramoAgent.didManagerCreate({
      provider: 'did:key',
      // For deterministic generation (if seed provided):
      // alias: seed ? `did-${seed}` : undefined,
    });
    
    // Get the keys associated with this DID
    const keys = await veramoAgent.keyManagerGet({
      kid: identifier.keys[0].kid,
    });
    
    console.log(`✅ DID created: ${identifier.did}`);
    
    // Return DID and key information
    res.status(201).json({
      did: identifier.did,
      keys: identifier.keys.map(k => ({
        kid: k.kid,
        type: k.type,
        // Don't expose private keys in response
        publicKeyHex: keys.publicKeyHex || 'N/A',
      })),
      message: 'DID created successfully',
    });
  } catch (error) {
    console.error('Error generating DID:', error);
    next(error);
  }
});

module.exports = router;

