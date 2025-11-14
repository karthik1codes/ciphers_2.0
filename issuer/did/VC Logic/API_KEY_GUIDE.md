# Issuer API Key Guide

## 🔑 Demo API Key

**Default Demo API Key:**
```
demo-issuer-api-key-change-in-production
```

## 📍 Where to Find/Set It

### Option 1: Use Default (No Configuration Needed)

If you don't set `ISSUER_API_KEY` in your `.env` file, the system automatically uses:
```
demo-issuer-api-key-change-in-production
```

### Option 2: Set in `.env` File

**File Location:** `issuer/did/VC Logic/.env`

```env
ISSUER_API_KEY=demo-issuer-api-key-change-in-production
```

Or use your own custom key:
```env
ISSUER_API_KEY=your-custom-api-key-here
```

## 🔒 Which Endpoints Require API Key?

### Protected Endpoints (Require API Key):

- **POST `/revoke`** - Revoke a credential
  - Requires: `X-API-Key` header

### Public Endpoints (No API Key Required):

- **POST `/generate-did`** - Generate a DID
- **POST `/issue`** - Issue a credential
- **POST `/issue-anchored`** - Issue anchored credential
- **POST `/receive-vc`** - Receive a credential
- **POST `/present`** - Present a credential
- **POST `/verify`** - Verify a credential
- **GET `/status/:credentialId`** - Check credential status
- **GET `/health`** - Health check

## 📝 How to Use the API Key

### Using `X-API-Key` Header (Recommended)

```bash
curl -X POST http://localhost:3000/revoke \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo-issuer-api-key-change-in-production" \
  -d '{
    "credentialId": "urn:uuid:..."
  }'
```

### Using `Authorization: Bearer` Header

```bash
curl -X POST http://localhost:3000/revoke \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-issuer-api-key-change-in-production" \
  -d '{
    "credentialId": "urn:uuid:..."
  }'
```

## 🎯 Quick Reference

| Setting | Value |
|---------|-------|
| **Default Demo Key** | `demo-issuer-api-key-change-in-production` |
| **Environment Variable** | `ISSUER_API_KEY` |
| **Location** | `issuer/did/VC Logic/.env` |
| **Header Name** | `X-API-Key` or `Authorization: Bearer` |
| **Used By** | `/revoke` endpoint only |

## ✅ For Demo/Testing

**You can use the default key without any configuration:**

1. **Don't set `ISSUER_API_KEY` in `.env`** - It will use the default
2. **Or explicitly set it:**
   ```env
   ISSUER_API_KEY=demo-issuer-api-key-change-in-production
   ```

## 🚨 For Production

**IMPORTANT:** Change the API key in production!

1. **Generate a strong, random API key:**
   ```bash
   # Generate a secure random key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set it in `.env`:**
   ```env
   ISSUER_API_KEY=your-strong-random-api-key-here
   ```

3. **Never commit the API key to version control!**

## 📋 Example `.env` File

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Key for issuer-only endpoints (demo)
ISSUER_API_KEY=demo-issuer-api-key-change-in-production

# Blockchain Configuration
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
ANCHOR_CONTRACT_ADDRESS=0x395B481E3B8b7e187F3F2B2Ee2095f7cB214C601
ISSUER_PRIVATE_KEY=your_private_key_here
```

## 🔍 Where It's Defined in Code

**File:** `issuer/did/VC Logic/utils/middleware.js`

```javascript
const validApiKey = process.env.ISSUER_API_KEY || 'demo-issuer-api-key-change-in-production';
```

This means:
- If `ISSUER_API_KEY` is set in `.env`, use that value
- Otherwise, use the default demo key

## 🎯 Summary

**For Demo/Testing:**
- ✅ Use: `demo-issuer-api-key-change-in-production`
- ✅ No configuration needed (it's the default)
- ✅ Or set it explicitly in `.env`

**For Production:**
- ⚠️ Generate a strong, random API key
- ⚠️ Set it in `.env` (never commit to git)
- ⚠️ Use proper authentication (OAuth2, JWT, etc.)

