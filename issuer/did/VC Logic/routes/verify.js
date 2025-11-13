/**
 * Verification Route
 * 
 * POST /verify
 * Verifies a Verifiable Credential (VC) or Verifiable Presentation (VP)
 * 
 * Request body (one of):
 * {
 *   vc: object,           // Verifiable Credential to verify
 *   vp: object,           // Verifiable Presentation to verify
 *   ipfsCid: string       // Optional: IPFS CID for integrity check
 * }
 * 
 * Returns: { valid: boolean, reasons: string[] }
 */

const express = require('express');
const router = express.Router();
const agent = require('../agent');
const { getCredentialById } = require('../utils/storage');
const { create } = require('ipfs-http-client');

/**
 * Verify a verifiable credential or presentation
 * 
 * Verification checks:
 * 1. Signature validity (via Veramo)
 * 2. Revocation status (from storage)
 * 3. IPFS integrity (if CID provided)
 * 
 * Edge cases:
 * - Revoked credentials return valid: false
 * - Invalid signatures return valid: false
 * - Missing credentials return valid: false
 */
router.post('/', async (req, res, next) => {
  try {
    const { vc, vp, ipfsCid } = req.body;
    
    // Validate request
    if (!vc && !vp) {
      return res.status(400).json({
        error: 'Missing required field: either vc or vp must be provided',
      });
    }
    
    const veramoAgent = agent.getAgent();
    const reasons = [];
    let isValid = true;
    
    // Verify signature using Veramo
    try {
      if (vc) {
        console.log('Verifying credential signature...');
        const verificationResult = await veramoAgent.verifyCredential({
          credential: vc,
        });
        
        if (!verificationResult.verified) {
          isValid = false;
          reasons.push('signature_invalid');
          console.log('❌ Credential signature verification failed');
        } else {
          console.log('✅ Credential signature verified');
        }
      } else if (vp) {
        console.log('Verifying presentation signature...');
        const verificationResult = await veramoAgent.verifyPresentation({
          presentation: vp,
        });
        
        if (!verificationResult.verified) {
          isValid = false;
          reasons.push('signature_invalid');
          console.log('❌ Presentation signature verification failed');
        } else {
          console.log('✅ Presentation signature verified');
        }
      }
    } catch (verificationError) {
      isValid = false;
      reasons.push(`verification_error: ${verificationError.message}`);
      console.error('Verification error:', verificationError);
    }
    
    // Check revocation status
    if (vc || (vp && vp.verifiableCredential && vp.verifiableCredential[0])) {
      const credentialToCheck = vc || (vp.verifiableCredential && vp.verifiableCredential[0]);
      const credentialId = credentialToCheck.id || credentialToCheck.vc?.id;
      
      if (credentialId) {
        // Extract UUID from credential ID if it's in URI format
        const uuid = credentialId.split(':').pop() || credentialId;
        
        try {
          const credentialRecord = await getCredentialById(uuid);
          
          if (credentialRecord && credentialRecord.revoked) {
            isValid = false;
            reasons.push('revoked');
            console.log(`❌ Credential ${credentialId} is revoked`);
            
            // Add revocation details if available
            if (credentialRecord.revokedAt) {
              reasons.push(`revoked_at: ${credentialRecord.revokedAt}`);
            }
            if (credentialRecord.revocationReason) {
              reasons.push(`revocation_reason: ${credentialRecord.revocationReason}`);
            }
          } else {
            console.log(`✅ Credential ${credentialId} is not revoked`);
          }
        } catch (storageError) {
          // Credential not found in storage - might be external
          // This is not necessarily a failure, but log it
          console.log(`⚠️  Credential ${credentialId} not found in local storage (may be external)`);
        }
      }
    }
    
    // Verify IPFS integrity (if CID provided)
    if (ipfsCid && isValid) {
      try {
        console.log(`Verifying IPFS integrity for CID: ${ipfsCid}...`);
        
        // Initialize IPFS client
        const ipfsApi = process.env.IPFS_API || '/ip4/127.0.0.1/tcp/5001';
        const ipfs = create(ipfsApi);
        
        // Fetch from IPFS
        const chunks = [];
        for await (const chunk of ipfs.cat(ipfsCid)) {
          chunks.push(chunk);
        }
        const ipfsContent = Buffer.concat(chunks).toString();
        const ipfsCredential = JSON.parse(ipfsContent);
        
        // Compare JSON structure (simplified comparison)
        // In production, use cryptographic hash comparison
        const credentialToCompare = vc || (vp?.verifiableCredential && vp.verifiableCredential[0]);
        const credentialJson = JSON.stringify(credentialToCompare, null, 2);
        const ipfsJson = JSON.stringify(ipfsCredential, null, 2);
        
        if (credentialJson === ipfsJson || 
            JSON.stringify(credentialToCompare) === JSON.stringify(ipfsCredential)) {
          console.log('✅ IPFS integrity verified');
        } else {
          isValid = false;
          reasons.push('ipfs_integrity_mismatch');
          console.log('❌ IPFS content does not match credential');
        }
      } catch (ipfsError) {
        console.warn('⚠️  IPFS verification failed:', ipfsError.message);
        reasons.push(`ipfs_check_failed: ${ipfsError.message}`);
        // Don't fail verification if IPFS check fails (IPFS might be unavailable)
      }
    }
    
    console.log(`Verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    
    res.json({
      valid: isValid,
      reasons: reasons.length > 0 ? reasons : (isValid ? ['all_checks_passed'] : []),
    });
  } catch (error) {
    console.error('Error verifying credential/presentation:', error);
    next(error);
  }
});

module.exports = router;

