# Fix Hardhat Installation - Alternative Method

## Problem
Hardhat toolbox has version conflicts with Hardhat 3.x

## Solution
We've switched to individual plugins compatible with Hardhat 2.22.0

## Steps to Fix

1. **Delete node_modules and package-lock.json:**
   ```bash
   cd contracts
   rm -rf node_modules package-lock.json
   ```
   Or on Windows:
   ```bash
   cd contracts
   rmdir /s /q node_modules
   del package-lock.json
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Compile contracts:**
   ```bash
   npm run compile
   ```

4. **Deploy to Amoy:**
   ```bash
   npm run deploy:anchor
   ```

## What Changed

- Removed `@nomicfoundation/hardhat-toolbox` (causing conflicts)
- Using individual plugins:
  - `@nomicfoundation/hardhat-ethers`
  - `@nomicfoundation/hardhat-chai-matchers`
  - `@nomicfoundation/hardhat-verify`
  - `@typechain/hardhat`
- Downgraded Hardhat to 2.22.0 (stable, compatible version)
- Added `ethers` v6 as direct dependency

## Alternative: Use Remix IDE

If Hardhat continues to have issues, you can deploy using Remix IDE:

1. Go to: https://remix.ethereum.org/
2. Create new file: `CredentialAnchor.sol`
3. Paste your contract code
4. Compile
5. Deploy using MetaMask (connected to Amoy testnet)

