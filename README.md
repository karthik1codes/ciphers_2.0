# CIPHERS - Decentralized Academic Credential System

A privacy-preserving Verifiable Credential (VC) system for academic credentials using Decentralized Identifiers (DIDs), blockchain anchoring, and selective disclosure.

## 🏗️ System Architecture

### Actors

1. **Student (Holder/DID Controller)**
   - Receives and stores verifiable credentials
   - Manages their decentralized identity
   - Controls credential disclosure

2. **College Admin (Issuer/DID Provider)**
   - Verifies student identity
   - Issues and signs verifiable credentials
   - Provides credential signatures for verification

3. **Recruiter (Verifier)**
   - Verifies student credentials
   - Validates derived proofs
   - Checks credential authenticity

4. **IPFS/Arweave (Decentralized Storage)**
   - Stores encrypted credential files
   - Returns Content Identifiers (CIDs)
   - Ensures data availability

## 🔄 Credential Flow

### 1. Issuance Phase

```
College Admin → Verifies Student → Creates VC → Signs with Private Key
     ↓
Student → Receives VC → Decrypts → Stores CID in Wallet
     ↓
Student → Uploads Encrypted Files → IPFS/Arweave
     ↓
IPFS/Arweave → Returns CID → Student Wallet
```

### 2. Verification Phase

```
Student → Selective Disclosure + Derived Proof → Recruiter
     ↓
Recruiter → Verifies Derived Proof
     ↓
College Admin → Credential Signature → Recruiter (for verification)
```

## 🔐 Key Features

- **Selective Disclosure**: Students reveal only necessary credential attributes
- **Derived Proofs**: Cryptographic proofs generated from original VCs
- **Decentralized Storage**: Credentials stored on IPFS/Arweave
- **Blockchain Anchoring**: Credential hashes anchored on Polygon Amoy
- **BBS+ Signatures**: Privacy-preserving cryptographic signatures
- **DID-based Identity**: Decentralized identifier management

## 📦 Components

- **Holder Wallet**: Student credential management interface
- **Issuer Dashboard**: College admin credential issuance system
- **Recruiter Console**: Verification and credential checking tools
- **Smart Contracts**: Credential anchoring on blockchain
- **VC Logic Service**: Backend service for credential operations

## 🚀 Quick Start

See individual component READMEs:
- `README_ANCHORED_CREDENTIALS.md` - End-to-end VC flow
- `CONNECT_FRONTEND_TO_BACKEND.md` - Service setup
- `NEXT_STEPS.md` - Deployment guide

## 🔗 Technology Stack

- **Blockchain**: Polygon Amoy Testnet
- **Storage**: IPFS/Arweave
- **DIDs**: did:key, did:ethr
- **Signatures**: BBS+ (BbsBlsSignature2020)
- **Standards**: W3C Verifiable Credentials, JSON-LD

