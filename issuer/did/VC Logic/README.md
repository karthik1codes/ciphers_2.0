# Verifiable Credentials Issuer Service

A complete Verifiable Credentials (VC) issuer service built with Veramo, Express, and IPFS. This service enables issuing, storing, verifying, and revoking verifiable credentials using W3C standards.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16
- npm or yarn
- (Optional) Local IPFS node for development

### Installation

1. **Clone and navigate to the project directory**

```bash
cd issuer/did/VC\ Logic
```

2. **Copy environment variables**

```bash
cp .env.example .env
```

3. **Edit `.env` file**

   - Set `ISSUER_API_KEY` (for demo, the default works)
   - Optionally set `IPFS_API` if you have a local IPFS node
   - For production, configure Ethereum RPC and private keys for `did:ethr`

4. **Install dependencies**

```bash
npm install
```

5. **Start the server**

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 📋 API Endpoints

### 1. Generate DID

**POST** `/generate-did`

Creates a new DID (Decentralized Identifier) using the Veramo agent.

**Request:**
```bash
curl -X POST http://localhost:3000/generate-did
```

**Optional body:**
```json
{
  "seed": "optional-seed-for-deterministic-generation"
}
```

**Response (201):**
```json
{
  "did": "did:key:z6Mk...",
  "keys": [
    {
      "kid": "key-1",
      "type": "Ed25519",
      "publicKeyHex": "abcd..."
    }
  ],
  "message": "DID created successfully"
}
```

### 2. Issue Verifiable Credential

**POST** `/issue`

Issues a new verifiable credential to a holder.

**Request:**
```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "holderDid": "did:key:z6Mk...",
    "type": "UniversityDegree",
    "claims": {
      "degree": "Bachelor of Science",
      "university": "Example University",
      "graduationDate": "2023-05-15"
    }
  }'
```

**Response (201):**
```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "UniversityDegree"],
    "credentialSubject": {
      "id": "did:key:z6Mk...",
      "degree": "Bachelor of Science",
      "university": "Example University",
      "graduationDate": "2023-05-15"
    },
    "issuer": "did:key:z6Mk...",
    "issuanceDate": "2024-01-15T10:00:00Z",
    "id": "uuid-here",
    "proof": { ... }
  },
  "cid": "QmHash..."
}
```

### 3. Receive VC (Holder saves received credential)

**POST** `/receive-vc`

Allows a holder to save a received verifiable credential to local storage.

**Request:**
```bash
curl -X POST http://localhost:3000/receive-vc \
  -H "Content-Type: application/json" \
  -d '{
    "vc": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "credentialSubject": { ... },
      "issuer": "did:key:...",
      "proof": { ... }
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Credential received and saved",
  "credentialId": "uuid-here"
}
```

### 4. Present Verifiable Presentation

**POST** `/present`

Creates a verifiable presentation with selective disclosure of credential fields.

**Request:**
```bash
curl -X POST http://localhost:3000/present \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "uuid-of-credential",
    "holderDid": "did:key:z6Mk...",
    "fields": ["degree", "university"]
  }'
```

**Response (200):**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiablePresentation"],
  "verifiableCredential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"],
    "credentialSubject": {
      "id": "did:key:z6Mk...",
      "degree": "Bachelor of Science",
      "university": "Example University"
    },
    "proof": { ... }
  },
  "proof": { ... }
}
```

**Note:** This is a mock selective disclosure using field filtering. In production, use BBS+ signatures or Zero-Knowledge proofs for true selective disclosure.

### 5. Verify Credential/Presentation

**POST** `/verify`

Verifies a verifiable credential or presentation, checks revocation status, and optionally validates IPFS integrity.

**Request:**
```bash
# Verify a VC
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "vc": { ... },
    "ipfsCid": "QmHash..."
  }'

# Verify a VP
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "vp": { ... }
  }'
```

**Response (200):**
```json
{
  "valid": true,
  "reasons": []
}

# Or if revoked:
{
  "valid": false,
  "reasons": ["revoked"]
}
```

### 6. Revoke Credential

**POST** `/revoke`

**Protected endpoint** - requires `X-API-Key` header.

Revokes a previously issued credential.

**Request:**
```bash
curl -X POST http://localhost:3000/revoke \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo-issuer-api-key-change-in-production" \
  -d '{
    "credentialId": "uuid-of-credential",
    "reason": "Credential no longer valid"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Credential revoked",
  "credentialId": "uuid-here",
  "revokedAt": "2024-01-15T10:30:00Z",
  "reason": "Credential no longer valid"
}
```

### 7. Check Credential Status

**GET** `/status/:credentialId`

Returns the current status of a credential.

**Request:**
```bash
curl http://localhost:3000/status/uuid-of-credential
```

**Response (200):**
```json
{
  "credentialId": "uuid-here",
  "status": "active"
}

# Or if revoked:
{
  "credentialId": "uuid-here",
  "status": "revoked",
  "revokedAt": "2024-01-15T10:30:00Z",
  "reason": "Credential no longer valid"
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- DID generation
- VC issuance
- VC verification (valid case)
- Credential revocation
- VC verification (revoked case)

## 🎬 Demo Script

Run the full demo flow:

```bash
npm run demo
```

Or manually run `demo.cmd` (Windows) or `demo.sh` (Unix).

The demo script will:
1. Start the server (or use an existing instance)
2. Generate a DID
3. Issue a sample credential
4. Verify the credential
5. Revoke the credential
6. Verify again (should fail)

## 🏗️ Architecture Summary

### Components

1. **Agent (`agent.js`)**
   - Veramo agent configuration
   - In-memory key management (KMS)
   - DID resolution (did:key and did:ethr support)
   - Credential signing and verification

2. **Storage (`utils/storage.js`)**
   - File-based credential storage (`data/credentials.json`)
   - Helper functions for CRUD operations
   - Revocation status tracking

3. **IPFS (`utils/ipfs.js`)**
   - Upload credentials to IPFS
   - Retry logic and error handling
   - CID generation and retrieval

4. **Routes**
   - RESTful API endpoints for VC lifecycle
   - Request validation
   - Error handling

### Data Flow

1. **Issuance Flow:**
   - Holder requests credential
   - Issuer creates VC using Veramo
   - VC saved to local storage
   - VC uploaded to IPFS
   - CID stored with credential record

2. **Verification Flow:**
   - Verifier receives VC/VP
   - Signature verified via Veramo
   - Revocation status checked
   - (Optional) IPFS integrity check

3. **Revocation Flow:**
   - Issuer calls revoke endpoint
   - Credential marked as revoked in storage
   - Future verifications return `valid: false`

## 🔒 Security Notes

⚠️ **This is a demo/prototype implementation. For production:**

1. **Key Management:**
   - Replace in-memory KMS with AWS KMS, HashiCorp Vault, or hardware security modules
   - See comments in `agent.js` for production KMS setup

2. **Authentication:**
   - Replace simple API key with OAuth2, JWT, or mTLS
   - Implement rate limiting and DDoS protection

3. **Storage:**
   - Use a proper database (PostgreSQL, MongoDB)
   - Implement encryption at rest
   - Add access controls and audit logs

4. **IPFS:**
   - Use private IPFS network or encrypted storage
   - Implement pinning services for reliability

5. **Selective Disclosure:**
   - Replace field filtering with BBS+ signatures or ZK proofs
   - See comments in `routes/present.js`

## 🚧 Future Improvements

### High Priority

- [ ] **Production KMS Integration**
  - AWS KMS, Azure Key Vault, or HashiCorp Vault
  - Hardware security module (HSM) support

- [ ] **Smart Contract Revocation Registry**
  - Ethereum-based revocation registry
  - See `hardhat/README.md` for details

- [ ] **BBS+ Selective Disclosure**
  - Replace mock field filtering with BBS+ signatures
  - True zero-knowledge selective disclosure

- [ ] **Database Integration**
  - PostgreSQL or MongoDB for credential storage
  - Query and indexing capabilities

### Medium Priority

- [ ] **DID Document Resolution**
  - Full DID resolution service
  - Support for multiple DID methods

- [ ] **Credential Templates**
  - Predefined credential schemas
  - Schema validation

- [ ] **Webhook Support**
  - Notify holders on revocation
  - Event-driven architecture

- [ ] **UI Integration**
  - React/Vue frontend for holders
  - Integration with T2 wallet system

### Low Priority

- [ ] **Multi-chain Support**
  - Support for Polygon, Avalanche, etc.
  - Cross-chain revocation

- [ ] **Credential Exchange Protocols**
  - DIDComm v2 support
  - OpenID4VC/OpenID4VCI

- [ ] **Performance Optimization**
  - Caching layer (Redis)
  - Batch operations

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to IPFS"**
- Ensure IPFS node is running: `ipfs daemon`
- Or use a public gateway by setting `IPFS_API` in `.env`
- Check firewall settings

**2. "DID resolution failed"**
- For `did:ethr`, ensure Ethereum RPC is configured
- Check network connectivity
- Verify DID format is correct

**3. "Credential verification fails"**
- Check that issuer DID matches the one used during issuance
- Verify credential hasn't been modified
- Check revocation status

**4. "Port already in use"**
- Change `PORT` in `.env`
- Or kill the process using the port: `netstat -ano | findstr :3000` (Windows)

**5. "Module not found"**
- Run `npm install` again
- Check Node.js version: `node --version` (should be >= 16)
- Clear `node_modules` and reinstall

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=veramo:* npm run dev
```

## 📚 Additional Resources

- [Veramo Documentation](https://veramo.io/docs)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [DID Specification](https://www.w3.org/TR/did-core/)
- [IPFS Documentation](https://docs.ipfs.io/)

## 📝 License

MIT

