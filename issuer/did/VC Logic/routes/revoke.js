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
 *   twoFA: string,         // 6-digit 2FA code from authenticator app
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
const { markRevoked, getCredentialById, getIssuer2FA, updateBackupCodes } = require('../utils/storage');
const { requireApiKey } = require('../utils/middleware');
const { verifyToken, verifyBackupCode, consumeBackupCode, is2FAConfigured } = require('../utils/twoFA');

/**
 * Revoke a credential
 * 
 * Protected endpoint - requires API key in X-API-Key header
 * In production, use proper authentication (OAuth2, JWT, mTLS, etc.)
 */
router.post('/', requireApiKey, async (req, res, next) => {
  try {
    const { credentialId, twoFA, reason } = req.body;
    
    // Validate request
    if (!credentialId) {
      return res.status(400).json({
        error: 'Missing required field: credentialId',
      });
    }
    
    // Check if 2FA is enabled for issuer
    const issuer2FA = getIssuer2FA();
    
    if (is2FAConfigured(issuer2FA)) {
      // 2FA is enabled - validate code
      if (!twoFA) {
        return res.status(400).json({
          error: '2FA code is required',
          message: 'Please provide a 6-digit 2FA code from your authenticator app',
        });
      }
      
      // Clean the token (remove spaces/dashes)
      const cleanToken = twoFA.replace(/\s|-/g, '');
      
      // Verify 2FA token
      const isValidToken = verifyToken(cleanToken, issuer2FA.secret);
      
      // If token is invalid, check backup codes
      if (!isValidToken) {
        const isValidBackupCode = verifyBackupCode(cleanToken, issuer2FA.backupCodes);
        
        if (!isValidBackupCode) {
          return res.status(401).json({
            error: 'Invalid 2FA code',
            message: 'The 2FA code provided is invalid. Please check your authenticator app or use a backup code.',
          });
        }
        
        // Backup code was valid - consume it
        const updatedBackupCodes = consumeBackupCode(cleanToken, issuer2FA.backupCodes);
        updateBackupCodes(updatedBackupCodes);
        
        console.log(`✅ Valid backup code used for revocation`);
      } else {
        console.log(`✅ Valid 2FA token verified for revocation`);
      }
    } else {
      // 2FA is not enabled - warn but allow (for demo/development)
      console.warn('⚠️  Revocation attempted without 2FA configured');
      
      if (!twoFA) {
        // In production, you might want to require 2FA setup first
        // For now, we'll allow revocation without 2FA if not configured
        console.warn('⚠️  Allowing revocation without 2FA (not configured)');
      }
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
      twoFAValidated: is2FAConfigured(issuer2FA),
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

