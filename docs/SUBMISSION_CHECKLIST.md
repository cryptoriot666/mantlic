# Mantlic — Judge Verification Checklist

**Time to verify: 30 seconds**

---

## One-Line Pitch
Mantlic is an autonomous AI trading agent for Mantle DeFi. Type natural language commands like "swap 100 MNT for USDC" and watch on-chain execution happen.

---

## Live Demo
**https://mantlic.vercel.app**

---

## Contract Verification (Direct Links)

### 1. Agent Registry (ERC-8004) — 12 pts + 10 pts
**https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349**

What you'll see:
- Contract deployed and verified
- AgentRegistered events
- BenchmarkRecorded events
- Reputation score updates

### 2. Swap Contract — 15 pts
**https://sepolia.mantlescan.xyz/address/0x46da6883626f51c500c662f7B934FA7DD0abE105**

What you'll see:
- Contract deployed and verified
- Swap execution transactions
- Fee tracking

**Total Points: 37 pts** — all verifiable on-chain

---

## Key Features

- **ERC-8004 On-Chain Agent Identity**: Every agent gets a unique blockchain NFT identity with reputation tracking
- **Natural Language to DeFi**: Type commands, no DEX clicking
- **1inch Fusion Integration**: Aggregated swaps across all Mantle DEXs
- **DeepSeek AI**: Working natural language processing
- **TradeCard Sharing**: Viral shareable results after every swap
- **Agent Leaderboard**: On-chain rankings by benchmark score
- **Three.js + GSAP UI**: Award-worthy animations

---

## How to Verify (Step by Step)

### Step 1: Verify Agent Registry (30 seconds)
1. Open: https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349
2. Click "Contract" tab → confirm code is verified
3. Click "Txn Logs" tab → see AgentRegistered and BenchmarkRecorded events
4. Done: 22 pts verified

### Step 2: Verify Swap Contract (15 seconds)
1. Open: https://sepolia.mantlescan.xyz/address/0x46da6883626f51c500c662f7B934FA7DD0abE105
2. Click "Contract" tab → confirm code is verified
3. Click "Txn Logs" tab → see swap execution transactions
4. Done: 15 pts verified

### Step 3: Test the App (30 seconds)
1. Open: https://mantlic.vercel.app
2. Click "Connect Wallet" → connect MetaMask (ensure Mantle Sepolia network)
3. Type "help" → see all available commands
4. Type "balance" → see wallet balances
5. Type "leaderboard" → see agent rankings

---

## Technical Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS v4
- **Wallet**: wagmi v2 + RainbowKit + viem
- **AI**: DeepSeek via @ai-sdk/deepseek
- **Animations**: Three.js (particles) + GSAP
- **Chain**: Mantle Sepolia (testnet)
- **Contracts**: Solidity 0.8.20 + OpenZeppelin

---

## GitHub
**https://github.com/cryptoriot666/mantlic**

---

Built for Mantle Turing Test Hackathon 2026
