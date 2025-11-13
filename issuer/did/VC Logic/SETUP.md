# Quick Setup Instructions

## Manual Setup Steps

### 1. Create `.env` file

Create a `.env` file in the root directory (`issuer/did/VC Logic/.env`) with the following contents:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Key for issuer-only endpoints (demo only - use proper auth in production)
ISSUER_API_KEY=demo-issuer-api-key-change-in-production

# IPFS Configuration
# Use public IPFS gateway by default, or set your own IPFS node
IPFS_API=/ip4/127.0.0.1/tcp/5001
# Alternative: IPFS_API=https://ipfs.infura.io:5001/api/v0

# Ethereum/Blockchain Configuration (for did:ethr)
# HARDHAT_RPC_URL=http://localhost:8545
# ETHEREUM_PRIVATE_KEY=your-private-key-here

# Production KMS Configuration (future work)
# AWS_KMS_KEY_ID=
# HASHICORP_VAULT_ADDR=
# HASHICORP_VAULT_TOKEN=

# Issuer DID (set this after generating your issuer DID)
# ISSUER_DID=did:ethr:0x...

# Notes:
# - Never commit .env to version control
# - For production, use proper key management services (AWS KMS, HashiCorp Vault, etc.)
# - Generate a strong API key for ISSUER_API_KEY in production
# - IPFS_API can point to Infura, Pinata, or your own IPFS node
```

### 2. Initialize `data/credentials.json`

The `data/credentials.json` file should already exist with an empty array `[]`. If it doesn't exist, create it:

```json
[]
```

Or if you want to pre-populate it with example credentials, copy the contents from the README examples or use the structure shown in `tests/api.test.js`.

### 3. Install Dependencies

```bash
cd "issuer/did/VC Logic"
npm install
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 5. Run Tests

```bash
npm test
```

### 6. Run Demo

```bash
npm run demo
```

Or manually run the demo script:

**Windows:**
```cmd
demo.cmd
```

**Unix/Linux/Mac:**
```bash
chmod +x demo.sh
./demo.sh
```

## File Structure

```
issuer/did/VC Logic/
├── .env                    # Create this manually (see above)
├── .gitignore             # ✅ Created
├── package.json           # ✅ Created
├── README.md              # ✅ Created
├── SETUP.md               # ✅ Created (this file)
├── server.js              # ✅ Created
├── agent.js               # ✅ Created
├── demo.cmd               # ✅ Created (Windows)
├── demo.sh                # ✅ Created (Unix)
├── routes/
│   ├── did.js             # ✅ Created
│   ├── issue.js           # ✅ Created
│   ├── receive.js         # ✅ Created
│   ├── present.js         # ✅ Created
│   ├── verify.js          # ✅ Created
│   └── revoke.js          # ✅ Created
├── utils/
│   ├── ipfs.js            # ✅ Created
│   ├── storage.js         # ✅ Created
│   └── middleware.js      # ✅ Created
├── data/
│   └── credentials.json   # ✅ Created (empty array, auto-populated on use)
├── tests/
│   └── api.test.js        # ✅ Created
└── hardhat/
    └── README.md          # ✅ Created (future work)
```

## Verification Checklist

- [x] All source files created
- [x] package.json with all dependencies
- [x] Routes implemented
- [x] Utilities implemented
- [x] Tests created
- [x] Demo scripts created
- [x] README with full documentation
- [ ] `.env` file created manually (required)
- [x] `data/credentials.json` initialized (created automatically, empty array)

## Next Steps

1. Create `.env` file (see above)
2. Run `npm install`
3. Start server with `npm start`
4. Test endpoints using demo script or curl commands (see README.md)

## Troubleshooting

If you encounter issues:

1. **Module not found errors**: Run `npm install` again
2. **Port already in use**: Change `PORT` in `.env`
3. **IPFS connection errors**: Either start a local IPFS node or use a public gateway (update `IPFS_API` in `.env`)
4. **Veramo agent errors**: Check that all dependencies are installed correctly

For more details, see `README.md`.

