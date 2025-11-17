/**
 * Two-Factor Authentication (2FA) Utility Functions
 * 
 * Implements TOTP (Time-based One-Time Password) for 2FA
 * Compatible with Google Authenticator, Authy, Microsoft Authenticator, etc.
 * 
 * Uses speakeasy for TOTP generation and validation
 * Uses qrcode for QR code generation
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a new TOTP secret for an issuer
 * 
 * @param {string} issuerName - Name of the issuer organization
 * @param {string} accountName - Account name (email or username)
 * @returns {object} - Secret configuration object
 */
function generateSecret(issuerName = 'Ciphers Issuer', accountName = 'issuer@mvjcollege.edu') {
  const secret = speakeasy.generateSecret({
    name: `${issuerName} (${accountName})`,
    issuer: issuerName,
    length: 32, // 256-bit secret for high security
  });

  return {
    secret: secret.base32, // Base32 encoded secret
    secretAscii: secret.ascii, // ASCII secret (keep this secure)
    qrCodeUrl: secret.otpauth_url, // URL for QR code
    backupCodes: generateBackupCodes(), // Backup codes for account recovery
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate backup codes for account recovery
 * 
 * @param {number} count - Number of backup codes to generate (default: 10)
 * @returns {Array<string>} - Array of backup codes
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric backup codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Generate QR code image data URL for the secret
 * 
 * @param {string} otpauthUrl - OTP auth URL from secret
 * @returns {Promise<string>} - Data URL of QR code image
 */
async function generateQRCode(otpauthUrl) {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 256,
      margin: 2,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token against a secret
 * 
 * @param {string} token - The 6-digit code from authenticator app
 * @param {string} secret - Base32 encoded secret
 * @param {number} window - Time window in steps (default: 1, allows ±30 seconds)
 * @returns {boolean} - True if token is valid
 */
function verifyToken(token, secret, window = 1) {
  if (!token || !secret) {
    return false;
  }

  // Remove any spaces or dashes from token
  const cleanToken = token.replace(/\s|-/g, '');

  // Validate token format (6 digits)
  if (!/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  // Verify token using speakeasy
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: cleanToken,
    window: window, // Allow tokens from ±window time steps (each step is 30 seconds)
  });

  return verified;
}

/**
 * Verify a backup code
 * 
 * @param {string} code - The backup code to verify
 * @param {Array<string>} backupCodes - Array of valid backup codes
 * @returns {boolean} - True if code is valid
 */
function verifyBackupCode(code, backupCodes) {
  if (!code || !backupCodes || !Array.isArray(backupCodes)) {
    return false;
  }

  const cleanCode = code.toUpperCase().replace(/\s|-/g, '');
  return backupCodes.includes(cleanCode);
}

/**
 * Remove a used backup code from the array
 * 
 * @param {string} code - The backup code that was used
 * @param {Array<string>} backupCodes - Array of backup codes
 * @returns {Array<string>} - Updated array without the used code
 */
function consumeBackupCode(code, backupCodes) {
  if (!code || !backupCodes || !Array.isArray(backupCodes)) {
    return backupCodes || [];
  }

  const cleanCode = code.toUpperCase().replace(/\s|-/g, '');
  return backupCodes.filter(c => c !== cleanCode);
}

/**
 * Check if 2FA is properly configured
 * 
 * @param {object} issuer2FA - Issuer 2FA configuration object
 * @returns {boolean} - True if 2FA is configured
 */
function is2FAConfigured(issuer2FA) {
  return issuer2FA && 
         issuer2FA.secret && 
         issuer2FA.enabled === true;
}

module.exports = {
  generateSecret,
  generateBackupCodes,
  generateQRCode,
  verifyToken,
  verifyBackupCode,
  consumeBackupCode,
  is2FAConfigured,
};
