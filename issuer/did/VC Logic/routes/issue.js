/**
 * Credential Issuance Route
 * 
 * POST /issue
 * Issues a new Verifiable Credential (VC) to a holder
 * 
 * Request body:
 * {
 *   holderDid: string,      // DID of the credential holder
 *   type: string,           // Credential type (e.g., "UniversityDegree")
 *   claims: object          // Claims to include in the credential
 * }
 * 
 * Returns: { credential: VC JSON, cid: IPFS CID }
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const agent = require('../agent');
const { saveCredential } = require('../utils/storage');
const { uploadToIPFS } = require('../utils/ipfs');

/**
 * Issue a verifiable credential
 * 
 * PRODUCTION NOTES:
 * - Set ISSUER_DID in .env to use a consistent issuer DID
 * - Change proofFormat from 'jwt' to 'lds' for JSON-LD format
 * - Add credential schema validation
 * - Implement credential templates
 */
router.post('/', async (req, res, next) => {
  try {
    const { holderDid, type, claims } = req.body;
    
    // Validate request
    if (!holderDid || !type || !claims) {
      return res.status(400).json({
        error: 'Missing required fields: holderDid, type, and claims are required',
      });
    }
    
    const veramoAgent = agent.getAgent();
    
    // Get or create issuer DID
    // In production, use a fixed issuer DID from .env
    let issuerDid = process.env.ISSUER_DID;
    if (!issuerDid) {
      // For demo: create a new issuer DID if not set
      console.log('⚠️  No ISSUER_DID set in .env, creating temporary issuer DID');
      const identifier = await veramoAgent.didManagerCreate({
        provider: 'did:key',
      });
      issuerDid = identifier.did;
      console.log(`Using issuer DID: ${issuerDid}`);
    }
    
    console.log(`Issuing credential of type "${type}" to ${holderDid}...`);
    
    // Create credential ID (URI format recommended)
    const credentialId = `urn:uuid:${uuidv4()}`;
    
    // Build the credential payload
    const credentialPayload = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        // Add custom context for your credential type
        // 'https://example.com/credentials/v1'
      ],
      type: ['VerifiableCredential', type],
      issuer: { id: issuerDid },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: holderDid,
        ...claims, // Spread claims into credentialSubject
      },
      credentialStatus: {
        id: `${process.env.BASE_URL || 'http://localhost:3000'}/status/${credentialId.split(':').pop()}`,
        type: 'RevocationList2020Status', // Or use your revocation registry
      },
      id: credentialId,
    };
    
    // Issue the credential using Veramo
    // proofFormat: 'jwt' for JWT format, 'lds' for JSON-LD with LD-Signatures
    const verifiableCredential = await veramoAgent.createVerifiableCredential({
      credential: credentialPayload,
      proofFormat: 'jwt', // Change to 'lds' for JSON-LD format
    });
    
    console.log(`✅ Credential issued: ${credentialId}`);
    
    // Save credential to local storage
    const credentialRecord = {
      id: credentialId,
      credential: verifiableCredential,
      type,
      holderDid,
      issuerDid,
      issuedAt: new Date().toISOString(),
      revoked: false,
    };
    
    await saveCredential(credentialRecord);
    
    // Upload to IPFS
    let cid = null;
    try {
      console.log('Uploading credential to IPFS...');
      cid = await uploadToIPFS(verifiableCredential);
      console.log(`✅ Credential uploaded to IPFS: ${cid}`);
      
      // Update credential record with CID
      credentialRecord.ipfsCid = cid;
      await saveCredential(credentialRecord);
    } catch (ipfsError) {
      console.warn('⚠️  Failed to upload to IPFS:', ipfsError.message);
      // Continue even if IPFS upload fails
    }
    
    // Return the issued credential
    res.status(201).json({
      credential: verifiableCredential,
      cid,
      credentialId,
      message: 'Credential issued successfully',
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    next(error);
  }
});

module.exports = router;

