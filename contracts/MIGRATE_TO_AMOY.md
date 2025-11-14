# ⚠️ IMPORTANT: Migrate from Mumbai to Amoy Testnet

## 🚨 Polygon Mumbai Testnet is Deprecated

**Polygon Mumbai testnet was deprecated in April 2024** and is no longer operational. All RPC endpoints are inactive.

**Solution:** Migrate to **Polygon Amoy Testnet** (the new testnet)

## 🔄 Quick Migration Guide

### Step 1: Update Environment Variables

Update `contracts/.env`:

```env
# OLD (Mumbai - Deprecated)
# MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# NEW (Amoy - Active)
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Your private key (same)
ISSUER_PRIVATE_KEY=your_private_key_here

# Contract address (will be new after redeployment)
ANCHOR_CONTRACT_ADDRESS=
```

### Step 2: Update MetaMask Network

**Add Polygon Amoy Testnet to MetaMask:**

⚠️ **Important:** MetaMask may suggest "POL" as the currency symbol, but **Amoy testnet uses MATIC** (not POL). POL is only for Polygon mainnet.

1. Open MetaMask
2. Click network selector → "Add Network" → "Add a network manually"
3. Enter these details **exactly**:
   - **Network Name:** `Polygon Amoy Testnet`
   - **RPC URL:** `https://rpc-amoy.polygon.technology`
   - **Chain ID:** `80002`
   - **Currency Symbol:** `MATIC` ⚠️ (NOT POL - ignore MetaMask's suggestion)
   - **Block Explorer URL:** `https://amoy.polygonscan.com`

4. **If MetaMask shows warnings:**
   - If it says "Chain ID already used by Amoy network" → You can edit the existing Amoy network instead
   - If it suggests "POL" → **Ignore it and use MATIC** (POL is for mainnet only)
   - The warning about token symbol mismatch is expected - click "Continue" anyway

5. Save and switch to Amoy network

**Alternative: Use ChainList (Easier)**
1. Go to: https://chainlist.org/chain/80002
2. Click "Connect Wallet" → MetaMask will auto-add Amoy with correct settings
3. This avoids manual entry and warnings

### Step 3: Get Testnet MATIC on Amoy

**Important:** You don't need a separate "Polygon wallet address"! Your MetaMask address works on all EVM chains including Amoy.

1. **Get your wallet address:**
   - Open MetaMask
   - Click your account name at the top
   - Click to copy your address (starts with `0x...`)
   - **This same address works on Ethereum, Polygon, Amoy, and all EVM chains**

2. **Request testnet MATIC (Multiple Options):**

   **Option 1: Official Polygon Faucet (Recommended)**
   - URL: https://faucet.polygon.technology/
   - Select **"Amoy"** network
   - Paste your MetaMask address
   - Receive: **0.5 MATIC**
   - Limit: Once per 24 hours

   **Option 2: Alchemy Faucet**
   - URL: https://www.alchemy.com/faucets/polygon-amoy
   - Sign up for free account: **1 MATIC per day**
   - Without account: **0.5 MATIC per day**
   - Requires: Alchemy account (free)

   **Option 3: QuickNode Faucet**
   - URL: https://faucet.quicknode.com/polygon/amoy
   - Connect wallet (MetaMask, Coinbase, Phantom)
   - Tweet about faucet: **2x tokens**
   - Requires: Social media account (optional for bonus)

   **Option 4: GetBlock Faucet**
   - URL: https://getblock.io/faucet/polygon-amoy
   - Register/login required
   - Share tweet: **Extra tokens**
   - Requires: GetBlock account (free)

   **Option 5: Bware Labs Faucet**
   - URL: https://bwarelabs.com/faucets/polygon-testnet
   - Enter wallet address
   - Click "Claim"
   - Limit: **Once per 24 hours**

   **Option 6: Chainlink Faucet**
   - URL: https://faucets.chain.link/polygon-amoy
   - Connect wallet
   - Verify via GitHub
   - Receive: **MATIC + LINK tokens**

**Note:** The same wallet address works across all EVM-compatible networks. You don't need different addresses for different chains!

### Step 4: Redeploy Contract

```bash
cd contracts

# Deploy to Amoy (new default)
npm run deploy:anchor

# Or explicitly specify Amoy
npx hardhat run scripts/deploy-anchor.ts --network amoy
```

### Step 5: Update Issuer Service

Update `issuer/did/VC Logic/.env`:

```env
# OLD
# MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# NEW
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Update contract address after redeployment
ANCHOR_CONTRACT_ADDRESS=0x... (new Amoy address)
```

## 📊 Network Comparison

| Feature | Mumbai (Deprecated) | Amoy (Active) |
|---------|---------------------|--------------|
| Status | ❌ Deprecated (April 2024) | ✅ Active |
| Chain ID | 80001 | 80002 |
| RPC URL | ❌ Not working | ✅ `https://rpc-amoy.polygon.technology` |
| Explorer | mumbai.polygonscan.com | amoy.polygonscan.com |
| Faucet | ❌ Not available | ✅ https://faucet.polygon.technology/ |

## 🔧 Alternative RPC Endpoints for Amoy

If the default Amoy RPC is slow, try these:

```env
# Option 1: Official Polygon (default)
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Option 2: Alchemy (requires API key)
AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY

# Option 3: Infura (requires API key)
AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_API_KEY

# Option 4: QuickNode (requires API key)
AMOY_RPC_URL=https://your-endpoint.polygon-amoy.quiknode.pro/YOUR_API_KEY
```

## ✅ Verification Checklist

After migration, verify:

- [ ] MetaMask shows "Polygon Amoy Testnet" network
- [ ] Chain ID is **80002** (not 80001)
- [ ] Account has **MATIC** balance on Amoy
- [ ] Contract deployed successfully to Amoy
- [ ] New contract address saved in `.env`
- [ ] Issuer service updated with Amoy RPC URL

## 🔗 Useful Links

- **Amoy Faucet:** https://faucet.polygon.technology/ (select Amoy)
- **Amoy Explorer:** https://amoy.polygonscan.com
- **Add Amoy to MetaMask:** Use ChainList - https://chainlist.org/chain/80002 (recommended - no warnings!)
- **Migration Guide:** https://docs.polygon.technology/docs/develop/network-details/amoy
- **MetaMask Setup Guide:** See `METAMASK_AMOY_SETUP.md` for detailed instructions on handling POL/MATIC warnings
- **Wallet Address FAQ:** See `WALLET_ADDRESS_FAQ.md` - You don't need a separate Polygon wallet address!
- **All Faucet Options:** See `AMOY_FAUCETS.md` - Complete guide to all available faucets

## ⚠️ Important Notes

1. **Old Mumbai contracts won't work** - You need to redeploy to Amoy
2. **Mumbai testnet MATIC is worthless** - Get new MATIC from Amoy faucet
3. **Update all RPC URLs** - Both contracts and issuer service
4. **Update explorer links** - Change from mumbai.polygonscan.com to amoy.polygonscan.com

## 🚀 Quick Commands

```bash
# Deploy to Amoy
cd contracts
npm run deploy:anchor

# Check network
npx hardhat run scripts/deploy-anchor.ts --network amoy
```

