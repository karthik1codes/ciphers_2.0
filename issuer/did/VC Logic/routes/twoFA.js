/**
 * Two-Factor Authentication (2FA) Routes
 * 
 * GET /2fa/status - Get current 2FA configuration status
 * POST /2fa/setup - Generate new 2FA secret and QR code
 * POST /2fa/enable - Enable 2FA after verifying setup code
 * POST /2fa/verify - Verify a 2FA code without enabling
 * POST /2fa/disable - Disable 2FA (requires valid code)
 * POST /2fa/backup-codes - Get or regenerate backup codes
 */

const express = require('express');
const router = express.Router();
const { requireApiKey } = require('../utils/middleware');
const { 
  getIssuer2FA, 
  enableIssuer2FA, 
  disableIssuer2FA,
  updateBackupCodes,
  getIssuer2FA as get2FA,
} = require('../utils/storage');
const {
  generateSecret,
  generateQRCode,
  verifyToken,
  is2FAConfigured,
} = require('../utils/twoFA');

/**
 * Get 2FA status
 */
router.get('/status', requireApiKey, async (req, res, next) => {
  try {
    const issuer2FA = getIssuer2FA();
    
    res.json({
      enabled: issuer2FA.enabled || false,
      configured: is2FAConfigured(issuer2FA),
      createdAt: issuer2FA.createdAt,
      enabledAt: issuer2FA.enabledAt,
      // Don't expose secret or backup codes in status
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    next(error);
  }
});

/**
 * Generate 2FA secret and QR code for setup
 */
router.post('/setup', requireApiKey, async (req, res, next) => {
  try {
    const { issuerName = 'MVJ College of Engineering', accountName = 'issuer@mvjcollege.edu' } = req.body;
    
    // Generate new secret
    const secretConfig = generateSecret(issuerName, accountName);
    
    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(secretConfig.qrCodeUrl);
    
    // Return setup information
    // NOTE: In production, you might want to store this temporarily until verified
    res.json({
      success: true,
      secret: secretConfig.secret, // Base32 secret for manual entry
      qrCodeUrl: secretConfig.qrCodeUrl, // OTP Auth URL
      qrCode: qrCodeDataUrl, // QR code image as data URL
      backupCodes: secretConfig.backupCodes, // Backup codes for account recovery
      issuerName,
      accountName,
      message: 'Scan the QR code with your authenticator app, then verify with /2fa/enable',
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    next(error);
  }
});

/**
 * Verify a 2FA code (without enabling)
 * Useful for testing during setup
 */
router.post('/verify', requireApiKey, async (req, res, next) => {
  try {
    const { token, secret } = req.body;
    
    if (!token || !secret) {
      return res.status(400).json({
        error: 'Missing required fields: token and secret',
      });
    }
    
    const isValid = verifyToken(token, secret);
    
    res.json({
      success: isValid,
      message: isValid ? '2FA code is valid' : '2FA code is invalid',
    });
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    next(error);
  }
});

/**
 * Enable 2FA after verifying setup code
 */
router.post('/enable', requireApiKey, async (req, res, next) => {
  try {
    const { secret, token, backupCodes } = req.body;
    
    if (!secret || !token) {
      return res.status(400).json({
        error: 'Missing required fields: secret and token',
      });
    }
    
    // Verify the token matches the secret
    const isValid = verifyToken(token, secret);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid 2FA code',
        message: 'The verification code does not match. Please check your authenticator app and try again.',
      });
    }
    
    // Enable 2FA with the verified secret
    const enabledConfig = enableIssuer2FA({
      secret,
      backupCodes: backupCodes || [],
    });
    
    console.log('✅ 2FA enabled for issuer');
    
    res.json({
      success: true,
      message: '2FA has been enabled successfully',
      enabled: true,
      enabledAt: enabledConfig.enabledAt,
      backupCodesCount: enabledConfig.backupCodes?.length || 0,
      // Return backup codes only once during setup
      backupCodes: enabledConfig.backupCodes,
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    next(error);
  }
});

/**
 * Disable 2FA (requires valid code for security)
 */
router.post('/disable', requireApiKey, async (req, res, next) => {
  try {
    const { token } = req.body;
    
    const issuer2FA = getIssuer2FA();
    
    if (!is2FAConfigured(issuer2FA)) {
      return res.status(400).json({
        error: '2FA is not enabled',
      });
    }
    
    // Require 2FA code to disable (security measure)
    if (!token) {
      return res.status(400).json({
        error: '2FA code is required to disable 2FA',
      });
    }
    
    // Verify token
    const isValid = verifyToken(token, issuer2FA.secret);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid 2FA code',
        message: 'Please provide a valid 2FA code to disable 2FA',
      });
    }
    
    // Disable 2FA
    disableIssuer2FA();
    
    console.log('✅ 2FA disabled for issuer');
    
    res.json({
      success: true,
      message: '2FA has been disabled successfully',
      enabled: false,
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    next(error);
  }
});

/**
 * Get backup codes (requires 2FA verification)
 */
router.post('/backup-codes', requireApiKey, async (req, res, next) => {
  try {
    const { token, regenerate = false } = req.body;
    
    const issuer2FA = getIssuer2FA();
    
    if (!is2FAConfigured(issuer2FA)) {
      return res.status(400).json({
        error: '2FA is not enabled',
      });
    }
    
    // Verify 2FA token to view backup codes
    if (!token) {
      return res.status(400).json({
        error: '2FA code is required to access backup codes',
      });
    }
    
    const isValid = verifyToken(token, issuer2FA.secret);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid 2FA code',
      });
    }
    
    let backupCodes = issuer2FA.backupCodes || [];
    
    // Regenerate backup codes if requested
    if (regenerate) {
      const { generateBackupCodes } = require('../utils/twoFA');
      backupCodes = generateBackupCodes();
      updateBackupCodes(backupCodes);
      console.log('✅ Backup codes regenerated');
    }
    
    res.json({
      success: true,
      backupCodes,
      count: backupCodes.length,
      message: regenerate ? 'Backup codes have been regenerated' : 'Backup codes retrieved',
      warning: 'Store these backup codes securely. They can be used if you lose access to your authenticator app.',
    });
  } catch (error) {
    console.error('Error getting backup codes:', error);
    next(error);
  }
});

module.exports = router;

