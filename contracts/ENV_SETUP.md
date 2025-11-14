# Environment Variables Setup

## 📍 Where to Set Environment Variables

Create a `.env` file in the **`contracts/`** directory.

**File Location:**
```
contracts/
  ├── .env              ← Create this file here
  ├── hardhat.config.ts
  ├── package.json
  └── ...
```

## 📝 Required Environment Variables

Create `contracts/.env` with the following:

```env
# Polygon Amoy Testnet RPC URL (Mumbai deprecated April 2024)
# Use Amoy instead of Mumbai
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Legacy Mumbai (for reference - not working)
# MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Your private key for deploying contracts
# IMPORTANT: Do NOT include the 0x prefix
# Get testnet MATIC from: https://faucet.polygon.technology/ (select Amoy)
ISSUER_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Contract address (set this AFTER deployment)
ANCHOR_CONTRACT_ADDRESS=
```

⚠️ **IMPORTANT:** Polygon Mumbai testnet was deprecated in April 2024. Use **Amoy testnet** instead!
See `MIGRATE_TO_AMOY.md` for migration instructions.

## 🔑 How to Get Your Private Key

### From MetaMask (Most Common)

1. **Open MetaMask extension**
2. **Click the account icon** (circle with account name) at the top
3. **Click "Account details"**
4. **Click "Show private key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (it will show with `0x` prefix)
7. **Remove the `0x` prefix** before adding to `.env`

**Example:**
- MetaMask shows: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- Use in `.env`: `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### From Other Wallets

**Trust Wallet:**
1. Settings → Security → Show Recovery Phrase
2. Export private key for specific address

**Coinbase Wallet:**
1. Settings → Advanced → Export Private Key

**Hardware Wallets (Ledger/Trezor):**
- Use the wallet's export function
- Or use a software wallet for testnet deployments

### Create a New Testnet Account

If you don't have a testnet account:

1. **Create in MetaMask:**
   - Add account → Create account
   - Name it "Testnet Deployer" or similar
   - Export private key as above

2. **Or use Hardhat's built-in accounts:**
   - Hardhat can generate accounts for local testing
   - For Mumbai deployment, you need a real account with MATIC

### Format the Private Key

**Important:** Remove the `0x` prefix if present!

```bash
# If MetaMask shows:
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Use in .env (without 0x):
ISSUER_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Quick check:**
- Private key should be exactly 64 characters (hexadecimal)
- No spaces, no `0x` prefix
- Only characters: 0-9, a-f, A-F

## 🔒 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Private key format:** Do NOT include `0x` prefix
   - ✅ Correct: `abc123def456...` (64 hex characters)
   - ❌ Wrong: `0xabc123def456...` (66 characters with 0x)
3. **Use testnet account** - Never use mainnet private keys
4. **Get testnet MATIC** - Your account needs **MATIC** (not POL) for gas:
   - ⚠️ **Important:** Mumbai testnet uses **MATIC**, not POL
   - Switch MetaMask to **Polygon Mumbai** testnet
   - Get testnet MATIC from:
     - https://faucet.polygon.technology/ (recommended - 0.5 MATIC)
     - https://mumbaifaucet.com/
   - You need at least **0.1 MATIC** (0.5 recommended)
5. **Never share your private key** - Anyone with it can control your account

📖 **See:** `contracts/GAS_FEES_AND_TOKENS.md` for gas costs and token requirements

## 🚀 Quick Setup

```bash
# 1. Navigate to contracts directory
cd contracts

# 2. Create .env file (copy the template above)
# On Windows: notepad .env
# On Linux/Mac: nano .env

# 3. Fill in your values
# - MUMBAI_RPC_URL (default is fine)
# - ISSUER_PRIVATE_KEY (your private key)
# - ANCHOR_CONTRACT_ADDRESS (leave empty for now)

# 4. Install dependencies
npm install

# 5. Deploy
npm run deploy:anchor

# 6. Copy the deployed address and add to .env
# ANCHOR_CONTRACT_ADDRESS=0x...
```

## ✅ Verify Setup

After creating `.env`, verify it's loaded:

```bash
cd contracts
npm run compile
```

If you see no errors, the environment variables are loaded correctly.

## 🔄 Alternative RPC Endpoints

If the default RPC is slow, try these alternatives:

```env
# Option 1: MaticVigil (default)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Option 2: Chainstack
MUMBAI_RPC_URL=https://matic-mumbai.chainstacklabs.com

# Option 3: Ankr
MUMBAI_RPC_URL=https://rpc.ankr.com/polygon_mumbai

# Option 4: Alchemy (requires API key)
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

## 📋 Example .env File

```env
# contracts/.env

MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
ISSUER_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ANCHOR_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

## ❓ Troubleshooting

**Error: "Cannot read property 'url' of undefined"**
- Make sure `.env` file exists in `contracts/` directory
- Check that `MUMBAI_RPC_URL` is set correctly

**Error: "insufficient funds"**
- Get testnet MATIC from faucet
- Verify your private key is correct

**Error: "invalid private key"**
- Make sure private key doesn't have `0x` prefix
- Check for extra spaces or newlines

