/**
 * Receive VC Route (Holder saves received credential)
 * 
 * POST /receive-vc
 * Allows a holder to save a received verifiable credential to local storage
 * 
 * Request body:
 * {
 *   vc: object  // Verifiable Credential JSON
 * }
 * 
 * Returns: { success: true, message, credentialId }
 */

const express = require('express');
const router = express.Router();
const { saveCredential } = require('../utils/storage');
const { v4: uuidv4 } = require('uuid');

/**
 * Receive and save a verifiable credential
 * 
 * This endpoint allows holders to store credentials they've received
 * In a production system, this might be replaced by a wallet app
 */
router.post('/', async (req, res, next) => {
  try {
    const { vc } = req.body;
    
    // Validate request
    if (!vc) {
      return res.status(400).json({
        error: 'Missing required field: vc (verifiable credential)',
      });
    }
    
    // Basic structure validation
    if (!vc['@context'] && !vc.vc) {
      return res.status(400).json({
        error: 'Invalid credential format: missing @context or vc field',
      });
    }
    
    // Extract credential ID
    // For JWT format, we might need to decode it
    let credentialId = vc.id || vc.credential?.id;
    if (!credentialId) {
      // Generate a temporary ID if not present
      credentialId = `urn:uuid:${uuidv4()}`;
      console.log('⚠️  No credential ID found, generating temporary ID');
    }
    
    // Extract holder DID from credential subject
    let holderDid = null;
    if (vc.credentialSubject?.id) {
      holderDid = vc.credentialSubject.id;
    } else if (vc.vc?.credentialSubject?.id) {
      holderDid = vc.vc.credentialSubject.id;
    }
    
    console.log(`Receiving credential ${credentialId} for holder ${holderDid || 'unknown'}...`);
    
    // Save credential to storage
    const credentialRecord = {
      id: credentialId,
      credential: vc,
      holderDid: holderDid || 'unknown',
      receivedAt: new Date().toISOString(),
      revoked: false,
    };
    
    await saveCredential(credentialRecord);
    
    console.log(`✅ Credential received and saved: ${credentialId}`);
    
    res.json({
      success: true,
      message: 'Credential received and saved',
      credentialId,
    });
  } catch (error) {
    console.error('Error receiving credential:', error);
    next(error);
  }
});

module.exports = router;

