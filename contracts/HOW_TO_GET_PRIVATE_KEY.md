# How to Get Your Private Key (Without 0x Prefix)

## 📍 Where to Find Your Private Key

### Method 1: MetaMask (Recommended)

1. **Open MetaMask browser extension**
2. **Click on your account name/icon** at the top of MetaMask
3. **Select "Account details"**
4. **Click "Show private key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (it will be shown with `0x` prefix)
7. **Remove the `0x` prefix** before using in `.env`

**Visual Guide:**
```
MetaMask → Account Menu → Account Details → Show Private Key
```

**Example:**
- MetaMask displays: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- Use in `.env`: `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Method 2: Create New Testnet Account

If you don't want to use your main account:

1. **In MetaMask:**
   - Click account icon → "Create account"
   - Name it "Testnet Deployer"
   - Export private key as above

2. **Get testnet MATIC:**
   - Go to https://faucet.polygon.technology/
   - Enter your new account address
   - Request testnet MATIC

### Method 3: Other Wallets

**Trust Wallet:**
- Settings → Security → Show Recovery Phrase
- Export private key for specific address

**Coinbase Wallet:**
- Settings → Advanced → Export Private Key

**Hardware Wallets:**
- Use software wallet for testnet (safer)
- Or use wallet's export function

## ✂️ How to Remove 0x Prefix

### Option 1: Manual (Simple)

Just delete the first two characters (`0x`) from the beginning:

```
Before: 0x1234567890abcdef...
After:  1234567890abcdef...
```

### Option 2: Using Text Editor

1. Copy the private key from MetaMask
2. Paste into a text editor
3. Find and replace: `0x` → (empty)
4. Copy the result

### Option 3: Using Command Line (Linux/Mac)

```bash
# If you have the key in a variable
PRIVATE_KEY="0x1234567890abcdef..."
echo ${PRIVATE_KEY#0x}  # Removes 0x prefix
```

### Option 4: Online Tool (Use with Caution)

- Use a simple text replacement tool
- **Never paste your private key on untrusted websites!**
- Better to do it manually

## ✅ Verify Your Private Key Format

Your private key should:
- ✅ Be exactly **64 characters** long
- ✅ Contain only **hexadecimal characters** (0-9, a-f, A-F)
- ✅ **NOT** start with `0x`
- ✅ Have **no spaces** or special characters

**Correct Examples:**
```
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ABCDEF1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

**Wrong Examples:**
```
0x1234567890abcdef...  ❌ Has 0x prefix
1234567890abcdef...    ❌ Too short (less than 64 chars)
12 34 56 78 90 ab...   ❌ Has spaces
```

## 🔐 Security Checklist

Before using your private key:

- [ ] Using a **testnet account** (not mainnet)
- [ ] Account has **testnet MATIC** for gas fees
- [ ] Private key is **64 hex characters** (no 0x)
- [ ] `.env` file is in `.gitignore` (already done)
- [ ] Never share or commit your private key
- [ ] Consider using a dedicated testnet account

## 🚨 Important Warnings

1. **Never use your mainnet private key** for testnet deployments
2. **Never commit `.env` file** to git (it's already ignored)
3. **Never share your private key** with anyone
4. **Never paste private key** on untrusted websites
5. **Use a dedicated testnet account** if possible

## 📝 Final Step: Add to .env

Once you have your private key (without 0x), add it to `contracts/.env`:

```env
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
ISSUER_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ANCHOR_CONTRACT_ADDRESS=
```

## 🆘 Troubleshooting

**"Invalid private key" error:**
- Check that you removed the `0x` prefix
- Verify it's exactly 64 characters
- Make sure there are no spaces

**"Insufficient funds" error:**
- Get testnet MATIC from faucet
- Verify you're using the correct account address

**"Network error" error:**
- Check `MUMBAI_RPC_URL` is correct
- Try alternative RPC endpoint

## 🔗 Useful Links

- Polygon Mumbai Faucet: https://faucet.polygon.technology/
- MetaMask Guide: https://metamask.io/
- Testnet Explorer: https://mumbai.polygonscan.com

