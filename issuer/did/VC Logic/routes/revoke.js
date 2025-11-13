/**
 * Revocation Route
 * 
 * POST /revoke
 * Revokes a previously issued verifiable credential
 * 
 * Protected by API key middleware (demo only - use proper auth in production)
 * 
 * Request body:
 * {
 *   credentialId: string,  // ID of credential to revoke
 *   reason?: string        // Optional revocation reason
 * }
 * 
 * GET /status/:credentialId
 * Returns the current status of a credential
 * 
 * Returns: { credentialId, status: "active" | "revoked", revokedAt?, reason? }
 */

const express = require('express');
const router = express.Router();
const { markRevoked, getCredentialById } = require('../utils/storage');
const { requireApiKey } = require('../utils/middleware');

/**
 * Revoke a credential
 * 
 * Protected endpoint - requires API key in X-API-Key header
 * In production, use proper authentication (OAuth2, JWT, mTLS, etc.)
 */
router.post('/', requireApiKey, async (req, res, next) => {
  try {
    const { credentialId, reason } = req.body;
    
    // Validate request
    if (!credentialId) {
      return res.status(400).json({
        error: 'Missing required field: credentialId',
      });
    }
    
    // Extract UUID from credential ID if it's in URI format
    const uuid = credentialId.split(':').pop() || credentialId;
    
    console.log(`Revoking credential ${credentialId}...`);
    
    // Check if credential exists
    const credentialRecord = await getCredentialById(uuid);
    if (!credentialRecord) {
      return res.status(404).json({
        error: 'Credential not found',
      });
    }
    
    // Check if already revoked
    if (credentialRecord.revoked) {
      return res.status(400).json({
        error: 'Credential is already revoked',
        credentialId,
        revokedAt: credentialRecord.revokedAt,
        reason: credentialRecord.revocationReason,
      });
    }
    
    // Revoke the credential
    await markRevoked(uuid, reason);
    
    console.log(`✅ Credential revoked: ${credentialId}`);
    
    res.json({
      success: true,
      message: 'Credential revoked',
      credentialId,
      revokedAt: new Date().toISOString(),
      reason: reason || 'No reason provided',
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    next(error);
  }
});

/**
 * Get credential status
 * 
 * Returns the current status (active or revoked) of a credential
 */
router.get('/:credentialId', async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    
    // Extract UUID from credential ID if it's in URI format
    const uuid = credentialId.split(':').pop() || credentialId;
    
    // Get credential from storage
    const credentialRecord = await getCredentialById(uuid);
    
    if (!credentialRecord) {
      return res.status(404).json({
        error: 'Credential not found',
      });
    }
    
    // Return status
    const response = {
      credentialId,
      status: credentialRecord.revoked ? 'revoked' : 'active',
    };
    
    if (credentialRecord.revoked) {
      response.revokedAt = credentialRecord.revokedAt;
      response.reason = credentialRecord.revocationReason;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error getting credential status:', error);
    next(error);
  }
});

module.exports = router;

