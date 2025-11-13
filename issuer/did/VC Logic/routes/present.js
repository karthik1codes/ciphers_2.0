/**
 * Verifiable Presentation Route
 * 
 * POST /present
 * Creates a Verifiable Presentation (VP) with selective disclosure and predicates
 * 
 * Request body:
 * {
 *   credentialId: string,  // ID of the credential to present
 *   holderDid: string,     // DID of the credential holder
 *   fields: string[]       // List of fields to include (selective disclosure)
 *   predicates: {           // Optional: Predicate-based filtering
 *     "fieldName": {
 *       operator: "gt" | "gte" | "lt" | "lte" | "eq",
 *       value: number | string
 *     }
 *   }
 * }
 * 
 * Returns: { verifiablePresentation: VP JSON }
 * 
 * IMPORTANT: This is a MOCK selective disclosure implementation using field filtering.
 * For production, use BBS+ signatures or Zero-Knowledge proofs for true selective disclosure.
 * See: https://w3c-ccg.github.io/ldp-bbs2020/
 */

const express = require('express');
const router = express.Router();
const agent = require('../agent');
const { getCredentialById } = require('../utils/storage');

/**
 * Create a verifiable presentation with selective disclosure
 * 
 * CURRENT IMPLEMENTATION: Field filtering (mock selective disclosure)
 * - Filters credentialSubject to only include requested fields
 * - Signs a VP containing the filtered credential
 * 
 * PRODUCTION IMPROVEMENTS:
 * 1. Use BBS+ signatures for true zero-knowledge selective disclosure
 * 2. Implement predicate proofs (e.g., "age >= 18" without revealing exact age)
 * 3. Support multiple credentials in one presentation
 * 4. Add presentation requirements/policies
 * 
 * BBS+ Implementation example:
 * - Use @veramo/credential-ld with BBS+ signature suite
 * - Transform credential to use BBS+ proof
 * - Create selective disclosure proof for specific fields
 */
// Helper function to get nested field value from object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to set nested field value in object using dot notation
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Helper function to evaluate predicate
function evaluatePredicate(actualValue, operator, predicateValue) {
  if (actualValue === null || actualValue === undefined) {
    return false;
  }

  const actual = typeof actualValue === 'string' && !isNaN(Date.parse(actualValue))
    ? new Date(actualValue).getTime()
    : typeof actualValue === 'number' ? actualValue : actualValue;
  
  const predicate = typeof predicateValue === 'string' && !isNaN(Date.parse(predicateValue))
    ? new Date(predicateValue).getTime()
    : typeof predicateValue === 'number' ? predicateValue : predicateValue;

  switch (operator) {
    case 'gt':
      return actual > predicate;
    case 'gte':
      return actual >= predicate;
    case 'lt':
      return actual < predicate;
    case 'lte':
      return actual <= predicate;
    case 'eq':
      return actual === predicate || String(actual) === String(predicate);
    default:
      return false;
  }
}

router.post('/', async (req, res, next) => {
  try {
    const { credentialId, holderDid, fields, predicates } = req.body;
    
    // Validate request
    if (!credentialId || !holderDid) {
      return res.status(400).json({
        error: 'Missing required fields: credentialId and holderDid are required',
      });
    }
    
    // Get the credential from storage
    const credentialRecord = await getCredentialById(credentialId);
    if (!credentialRecord) {
      return res.status(404).json({
        error: 'Credential not found',
      });
    }
    
    // Check if credential belongs to holder
    if (credentialRecord.holderDid !== holderDid) {
      return res.status(403).json({
        error: 'Credential does not belong to the specified holder',
      });
    }
    
    // Check if credential is revoked
    if (credentialRecord.revoked) {
      return res.status(400).json({
        error: 'Cannot present a revoked credential',
      });
    }
    
    const veramoAgent = agent.getAgent();
    const originalCredential = credentialRecord.credential;
    
    console.log(`Creating presentation for credential ${credentialId}...`);
    console.log(`Selective disclosure fields: ${fields ? fields.join(', ') : 'all fields'}`);
    if (predicates) {
      console.log(`Predicates: ${JSON.stringify(predicates)}`);
    }
    
    // MOCK SELECTIVE DISCLOSURE: Filter credentialSubject fields
    // This is NOT zero-knowledge - it's just field filtering
    // For predicates, we include a status indicator instead of the actual value
    let filteredCredentialSubject = { id: holderDid };
    
    const credentialSubject = originalCredential.credentialSubject || 
                             originalCredential.vc?.credentialSubject || {};
    
    if (fields && Array.isArray(fields) && fields.length > 0) {
      // Process each field
      fields.forEach(fieldPath => {
        const actualValue = getNestedValue(credentialSubject, fieldPath);
        
        // Check if this field has a predicate
        if (predicates && predicates[fieldPath]) {
          const predicate = predicates[fieldPath];
          const predicateResult = evaluatePredicate(actualValue, predicate.operator, predicate.value);
          
          if (!predicateResult) {
            console.warn(`Predicate validation failed for ${fieldPath}: ${predicate.operator} ${predicate.value}`);
            return; // Skip this field if predicate fails
          }
          
          // For predicate fields, include a status indicator instead of actual value
          // In a real ZK implementation, this would be a cryptographic proof
          const operatorSymbols = {
            'gt': '>',
            'gte': '≥',
            'lt': '<',
            'lte': '≤',
            'eq': '='
          };
          
          setNestedValue(filteredCredentialSubject, fieldPath, {
            predicate: `${operatorSymbols[predicate.operator]} ${predicate.value}`,
            verified: true,
            note: 'This is a mock predicate proof. In production, use BBS+ signatures for true zero-knowledge proofs.'
          });
        } else {
          // Regular field inclusion - handle nested paths properly
          if (actualValue !== undefined) {
            // If it's a nested path, we need to preserve the structure
            if (fieldPath.includes('.')) {
              setNestedValue(filteredCredentialSubject, fieldPath, actualValue);
            } else {
              // Simple field
              filteredCredentialSubject[fieldPath] = actualValue;
            }
          }
        }
      });
    } else {
      // Include all fields if no specific fields requested
      filteredCredentialSubject = { ...credentialSubject, id: holderDid };
    }
    
    // Build filtered credential for presentation
    // In a real implementation, this would use BBS+ selective disclosure proofs
    const filteredCredential = {
      ...originalCredential,
      credentialSubject: filteredCredentialSubject,
    };
    
    // Create Verifiable Presentation
    // In production, the holder would sign this with their own keys
    // For demo, we're using a simplified approach
    const verifiablePresentation = await veramoAgent.createVerifiablePresentation({
      presentation: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: [filteredCredential],
        holder: holderDid,
      },
      proofFormat: 'jwt', // Change to 'lds' for JSON-LD with BBS+
    });
    
    console.log(`✅ Presentation created (NOTE: This uses mock field filtering and predicates, not true ZK proofs)`);
    
    res.json({
      verifiablePresentation,
      message: 'Presentation created successfully',
      note: predicates 
        ? 'This implementation uses field filtering and mock predicates for selective disclosure. For production, implement BBS+ signatures or ZK proofs.'
        : 'This implementation uses field filtering for selective disclosure. For production, implement BBS+ signatures or ZK proofs.',
    });
  } catch (error) {
    console.error('Error creating presentation:', error);
    next(error);
  }
});

module.exports = router;

