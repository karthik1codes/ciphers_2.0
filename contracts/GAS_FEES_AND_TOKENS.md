# Gas Fees and Token Requirements for Contract Deployment

## ⚠️ IMPORTANT: Mumbai Testnet is Deprecated!

**Polygon Mumbai testnet was deprecated in April 2024!**

**Use Polygon Amoy testnet instead** - See `MIGRATE_TO_AMOY.md` for migration guide.

## ❌ Important: POL vs MATIC

**You need MATIC (not POL) for Polygon Amoy testnet deployment!**

### Token Confusion Explained

- **POL** = Polygon's new native token (used on Polygon mainnet)
- **MATIC** = Used on Polygon **Amoy testnet** for gas fees
- **Amoy Testnet** = Uses testnet MATIC, not POL
- **Mumbai Testnet** = ❌ Deprecated (April 2024) - No longer works!

## 💰 How Much Do You Need?

### For Contract Deployment

**CredentialAnchor Contract** (simple contract):
- **Estimated gas cost:** 0.01 - 0.05 MATIC
- **Recommended amount:** 0.1 - 0.5 MATIC (to be safe)

**Your current balance:** 0.100 POL
- ❌ **Not enough** - You have POL, not MATIC
- ❌ **Wrong network** - POL is for mainnet, not testnet
- ❌ **Wrong token** - Amoy testnet requires testnet MATIC
- ❌ **Mumbai is deprecated** - Use Amoy testnet instead!

## ✅ What You Need to Do

### Step 1: Switch to Amoy Testnet

1. **Open MetaMask**
2. **Click network selector** (top of MetaMask)
3. **Select "Polygon Amoy Testnet"** (Mumbai is deprecated!)
   - If not listed, add it manually:
     - Network Name: `Polygon Amoy Testnet`
     - RPC URL: `https://rpc-amoy.polygon.technology`
     - Chain ID: `80002` (not 80001!)
     - Currency Symbol: `MATIC`
     - Block Explorer: `https://amoy.polygonscan.com`

### Step 2: Get Testnet MATIC

**Option 1: Official Polygon Faucet (Recommended)**
- URL: https://faucet.polygon.technology/
- Select **"Amoy"** network
- Receive: **0.5 MATIC**
- Limit: Once per 24 hours

**Option 2: Alchemy Faucet**
- URL: https://www.alchemy.com/faucets/polygon-amoy
- With free account: **1 MATIC per day**
- Without account: **0.5 MATIC per day**
- Requires: Alchemy account (free signup)

**Option 3: QuickNode Faucet**
- URL: https://faucet.quicknode.com/polygon/amoy
- Connect wallet (MetaMask, Coinbase, Phantom)
- Tweet bonus: **2x tokens**
- Requires: Social media (optional)

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
- Connect wallet + verify via GitHub
- Receive: **MATIC + LINK tokens**

### Step 3: Verify Your Balance

After receiving testnet MATIC:
- Check MetaMask shows **MATIC** (not POL)
- Balance should show: **0.5 MATIC** or more
- Network should be: **Polygon Amoy Testnet** (Chain ID: 80002)

## 📊 Gas Cost Breakdown

### Typical Gas Costs on Mumbai Testnet

| Operation | Gas Units | Cost (MATIC on Amoy) |
|-----------|-----------|---------------------|
| Simple contract deployment | ~500,000 | 0.01 - 0.02 |
| Medium contract deployment | ~1,000,000 | 0.02 - 0.05 |
| Complex contract deployment | ~2,000,000 | 0.05 - 0.1 |
| Anchor credential hash | ~50,000 | 0.001 - 0.002 |

**CredentialAnchor is a simple contract** → Expect ~0.01 - 0.02 MATIC on Amoy

## 🔍 Check Your Current Balance

The deployment script will show your balance:

```bash
npm run deploy:anchor
```

Output will show:
```
Deploying CredentialAnchor with account: 0x...
Account balance: 500000000000000000  (0.5 MATIC in wei)
```

If balance is 0 or very low, you'll get an "insufficient funds" error.

## ⚠️ Common Mistakes

### ❌ Wrong Token
- **Problem:** Using POL instead of MATIC
- **Solution:** Switch to Mumbai testnet and get testnet MATIC

### ❌ Wrong Network
- **Problem:** On Polygon mainnet or deprecated Mumbai testnet
- **Solution:** Switch MetaMask to "Polygon Amoy Testnet" (Chain ID: 80002)

### ❌ Mainnet Tokens
- **Problem:** Using real MATIC/POL from mainnet
- **Solution:** Use testnet MATIC from faucet (it's free!)

### ❌ Insufficient Balance
- **Problem:** Less than 0.01 MATIC
- **Solution:** Request more from faucet (0.5 MATIC recommended)

## ✅ Quick Checklist

Before deploying, verify:

- [ ] MetaMask is on **Polygon Amoy Testnet** (Chain ID: 80002)
- [ ] Account shows **MATIC** (not POL) balance
- [ ] Balance is at least **0.1 MATIC** (0.5 recommended)
- [ ] You're using a **testnet account** (not mainnet)
- [ ] Private key in `.env` matches the account with MATIC
- [ ] Using **Amoy RPC URL** (not deprecated Mumbai)

## 🚀 After Getting Testnet MATIC

1. **Verify balance in MetaMask:**
   - Should show: "0.5 MATIC" or more
   - Network: "Polygon Amoy Testnet" (Chain ID: 80002)

2. **Deploy contract:**
   ```bash
   cd contracts
   npm run deploy:anchor
   ```

3. **Check output:**
   ```
   Account balance: 500000000000000000  ✅ (0.5 MATIC)
   ✅ CredentialAnchor deployed to: 0x...
   ```

## 💡 Why Testnet MATIC is Free

- Testnet tokens have **no real value**
- Faucets give them away **for free**
- Used only for **testing and development**
- **Never** use mainnet tokens for testnet!

## 🔗 Useful Links

- **Polygon Amoy Faucets:**
  - Official: https://faucet.polygon.technology/ (select Amoy)
  - Alchemy: https://www.alchemy.com/faucets/polygon-amoy
  - QuickNode: https://faucet.quicknode.com/polygon/amoy
  - See `AMOY_FAUCETS.md` for complete list
- **Amoy Explorer:** https://amoy.polygonscan.com
- **Add Amoy to MetaMask:** https://chainlist.org/chain/80002
- **Migration Guide:** See `MIGRATE_TO_AMOY.md`

