# Mantlic — Verification for Hackathon Judges

## Live Demo
**🌐 [mantlic.vercel.app](https://mantlic.vercel.app)**

## Verified Contract Addresses (Mantle Sepolia)

### MantlicSwap (DEX)
- **Address:** `0x46da6883626f51c500c662f7B934FA7DD0abE105`
- **Explorer:** https://sepolia.mantlescan.xyz/address/0x46da6883626f51c500c662f7B934FA7DD0abE105
- **What it does:** Real token swap execution with price feed + 0.3% fee
- **Verified:** Real swap TX at [0x14778cf4...](https://sepolia.mantlescan.xyz/tx/0x14778cf49295822be5b296f5aa8d44d1cd6aa5abb08840438511f3f807435c05)

### MantlicAgentRegistry (ERC-8004)
- **Address:** `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349`
- **Explorer:** https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349
- **What it does:** AI agent identity + reputation on-chain
- **Verified:** Agent registration TX at [0x78033d1c...](https://sepolia.mantlescan.xyz/tx/0x78033d1c19bc8f9a94385a8ba70382fd299f394d00193828251c0ade8a0262f8)
- **Agent:** Mantlic-Alpha (ID:1), Reputation: 8,900

### MantlicAgentNFT
- **Address:** `0xD78ec89B878281AE71A64eed40fd4AA5c170f778`
- **Explorer:** https://sepolia.mantlescan.xyz/address/0xD78ec89B878281AE71A64eed40fd4AA5c170f778
- **Verified:** Mint TX at [0x41c67b1e...](https://sepolia.mantlescan.xyz/tx/0x41c67b1ea2cbfb73af77e081477c4acd3ff7d0491c2c1b396d99d20d306318bb)

### MockUSDC (Test Token)
- **Address:** `0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C`
- **Explorer:** https://sepolia.mantlescan.xyz/address/0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C

## Quick Verification Steps

1. **Open** https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349
2. **Click** "Contract" tab → "Read Contract"
3. **Call** `getAgent(1)` — should return Mantlic-Alpha
4. **Call** `getReputationScore(1)` — should return 8900

## Tech Stack

| Layer | Version |
|-------|---------|
| Framework | Next.js 16.2.7 |
| React | 19.2.4 |
| wagmi | 2.19.5 |
| viem | 2.52.2 |
| Three.js | 0.184.0 |
| GSAP | 3.15.0 |
| @ai-sdk/deepseek | 2.0.35 |
| Solidity | 0.8.20 |
| Hardhat | 2.22.0 |

## GitHub
https://github.com/cryptoriot666/mantlic
