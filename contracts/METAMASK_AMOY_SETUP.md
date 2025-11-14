# MetaMask Setup for Polygon Amoy Testnet

## ⚠️ Common MetaMask Warning: POL vs MATIC

When adding Polygon Amoy testnet to MetaMask, you may see:
- **Warning:** "Suggested currency symbol: POL"
- **Warning:** "Token symbol doesn't match network name"

**This is normal!** Here's why:

### POL vs MATIC Explained

| Network | Currency Symbol | Use Case |
|---------|----------------|----------|
| **Polygon Mainnet** | POL | Production (real tokens) |
| **Polygon Amoy Testnet** | MATIC | Testing (free testnet tokens) |

**Amoy testnet uses MATIC, not POL!** MetaMask suggests POL because it's the mainnet currency, but testnets still use MATIC.

## ✅ Correct Settings for Amoy

When adding Amoy to MetaMask, use these settings:

```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC  ← Use this (NOT POL)
Block Explorer: https://amoy.polygonscan.com
```

## 🔧 How to Add Amoy (Step-by-Step)

### Method 1: Manual Entry (If MetaMask Shows Warnings)

1. **Open MetaMask** → Click network selector (top)
2. **Click "Add Network"** → "Add a network manually"
3. **Enter the settings above**
4. **If MetaMask shows warnings:**
   - ⚠️ "Suggested currency symbol: POL" → **Ignore it, use MATIC**
   - ⚠️ "Token symbol doesn't match" → **Click "Continue" anyway**
   - ⚠️ "Chain ID already used by Amoy" → **Edit existing Amoy network instead**

5. **Click "Save"** → Switch to Amoy network

### Method 2: Use ChainList (Recommended - No Warnings)

1. **Go to:** https://chainlist.org/chain/80002
2. **Click "Connect Wallet"**
3. **Approve in MetaMask**
4. **Amoy will be added automatically** with correct settings (no warnings!)

### Method 3: Edit Existing Amoy Network

If MetaMask says "Chain ID already used by Amoy network":

1. **Open MetaMask** → Settings → Networks
2. **Find "Polygon Amoy Testnet"** (or similar)
3. **Click to edit**
4. **Verify settings:**
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC` (not POL)
5. **Save changes**

## 🎯 Why MetaMask Suggests POL

MetaMask's suggestion algorithm:
- Sees "Polygon" in network name
- Knows Polygon mainnet uses POL
- Suggests POL automatically

**But testnets are different:**
- Amoy testnet = MATIC (free test tokens)
- Polygon mainnet = POL (real tokens)

## ✅ Verification Checklist

After adding Amoy, verify:

- [ ] Network name: "Polygon Amoy Testnet"
- [ ] Chain ID: **80002** (not 80001)
- [ ] Currency symbol: **MATIC** (not POL)
- [ ] RPC URL: `https://rpc-amoy.polygon.technology`
- [ ] Explorer: `https://amoy.polygonscan.com`
- [ ] Balance shows "MATIC" (not POL)

## 🚨 Troubleshooting

### Problem: MetaMask keeps suggesting POL

**Solution:** 
- Ignore the suggestion
- Manually enter "MATIC" in currency symbol field
- Click "Continue" even if it shows a warning

### Problem: "Chain ID already used by Amoy network"

**Solution:**
- Don't add a new network
- Edit the existing Amoy network instead
- Or use ChainList to auto-add it correctly

### Problem: Balance shows 0 but I have tokens

**Solution:**
- Check you're on **Amoy testnet** (Chain ID: 80002)
- Check currency symbol is **MATIC** (not POL)
- Get testnet MATIC from: https://faucet.polygon.technology/ (select Amoy)
- **Use your MetaMask address** - you don't need a separate Polygon wallet address!

### Problem: Do I need a separate Polygon wallet address?

**Answer: No!**
- Your MetaMask address works on **all EVM chains** (Ethereum, Polygon, Amoy, etc.)
- The same address (`0x...`) is used across all networks
- Just switch networks in MetaMask - your address stays the same

### Problem: Can't connect to RPC

**Solution:**
- Verify RPC URL: `https://rpc-amoy.polygon.technology`
- Try alternative RPC:
  - `https://rpc.ankr.com/polygon_amoy`
  - `https://polygon-amoy.drpc.org`

## 📝 Quick Reference

**Correct Amoy Settings:**
```
Network: Polygon Amoy Testnet
RPC: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency: MATIC ← Important!
Explorer: https://amoy.polygonscan.com
```

**Wrong Settings (Don't Use):**
```
❌ Currency: POL (this is for mainnet only)
❌ Chain ID: 80001 (this is deprecated Mumbai)
❌ RPC: https://rpc-mumbai... (Mumbai is deprecated)
```

## 🔗 Useful Links

- **ChainList (Auto-add Amoy):** https://chainlist.org/chain/80002
- **Amoy Faucet:** https://faucet.polygon.technology/ (select Amoy)
- **Amoy Explorer:** https://amoy.polygonscan.com
- **Polygon Docs:** https://docs.polygon.technology/docs/develop/network-details/amoy

