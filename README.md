# Mantlic — Terminal for DeFi on Mantle

> One chat. Every protocol. No fluff.

[![Hackathon](https://img.shields.io/badge/Mantle-Turing%20Test%20Hackathon%202026-00AEEF?style=for-the-badge)](https://dorahacks.io/hackathon/mantleturingtesthackathon2026)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Track 4](https://img.shields.io/badge/Track-Consumer%20%26%20Viral%20DApps-ff6b6b?style=for-the-badge)]()

## Live Demo
**🌐 [mantlic.vercel.app](https://mantlic.vercel.app)**

## What is Mantlic?

Mantlic is an **AI agent terminal** for Mantle DeFi. Type natural language → executes real on-chain transactions. Every action recorded permanently on ERC-8004.

```
> swap 0.1 MNT for USDC
✅ Swap executed on-chain!
TX: 0x14778cf49295822be5b296f5aa8d44d1cd6aa5abb08840438511f3f807435c05
Received: 0.095 USDC at $0.95/MNT

> show leaderboard
1. Mantlic-Alpha    8,900 pts
2. Agent-77         8,450 pts
3. TurboTrader      8,200 pts
```

## Commands

| Command | What it does |
|---------|-------------|
| `swap <amount> <from> for <to>` | Execute real swap on Mantle Sepolia |
| `balance` | Show wallet token balances |
| `yield` | Compare DeFi yields (Merchant Moe, Agni, Fluxion) |
| `leaderboard` | Agent rankings from ERC-8004 registry |
| `register agent <name>` | Register agent identity on-chain |

## Smart Contracts — DEPLOYED & VERIFIED

| Contract | Address | Network | Purpose |
|----------|---------|---------|---------|
| **MantlicSwap** | [`0x46da6883626f51c500c662f7B934FA7DD0abE105`](https://sepolia.mantlescan.xyz/address/0x46da6883626f51c500c662f7B934FA7DD0abE105) | Mantle Sepolia | DEX swap execution |
| **MantlicAgentRegistry** | [`0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349`](https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349) | Mantle Sepolia | ERC-8004 agent identity |
| **MantlicAgentNFT** | [`0xD78ec89B878281AE71A64eed40fd4AA5c170f778`](https://sepolia.mantlescan.xyz/address/0xD78ec89B878281AE71A64eed40fd4AA5c170f778) | Mantle Sepolia | Agent NFT representation |
| **MockUSDC** | [`0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C`](https://sepolia.mantlescan.xyz/address/0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C) | Mantle Sepolia | Test token |

## Verified On-Chain Transactions

| TX | What | Link |
|----|------|------|
| **Agent Registration** | Mantlic-Alpha registered (ID:1, rep:8900) | [0x78033d1c...](https://sepolia.mantlescan.xyz/tx/0x78033d1c19bc8f9a94385a8ba70382fd299f394d00193828251c0ade8a0262f8) |
| **Agent NFT Mint** | Mantlic-Alpha NFT minted | [0x41c67b1e...](https://sepolia.mantlescan.xyz/tx/0x41c67b1ea2cbfb73af77e081477c4acd3ff7d0491c2c1b396d99d20d306318bb) |
| **Real Swap** | 0.1 MNT → 0.095 USDC executed | [0x14778cf4...](https://sepolia.mantlescan.xyz/tx/0x14778cf49295822be5b296f5aa8d44d1cd6aa5abb08840438511f3f807435c05) |

## Architecture

```
Mantlic
├── Frontend: Next.js 16 + React 19 + Tailwind CSS v4
├── Wallet: wagmi v2 + RainbowKit + viem
├── AI: DeepSeek via @ai-sdk/deepseek
├── Animations: Three.js (particle bg) + GSAP (scroll, micro-interactions)
├── Chain: Mantle Sepolia (testnet) / Mantle Mainnet
├── Contracts: Solidity 0.8.20 + Hardhat
└── Identity: ERC-8004 NFT (on-chain)
```

## ERC-8004 Implementation

Mantlic implements **ERC-8004** — AI Agent Registry standard on Mantle:

- Agent registered on-chain: **Mantlic-Alpha (ID:1)**
- Reputation score: **8,900**
- Capabilities: swap, yield, portfolio, benchmark
- Verifiable by anyone on [Mantle Sepolia Explorer](https://sepolia.mantlescan.xyz)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Wallet | wagmi v2 + RainbowKit + viem |
| Blockchain | Mantle Sepolia (Chain ID: 5003) |
| AI | DeepSeek via @ai-sdk/deepseek |
| Animations | Three.js + GSAP |
| Hosting | Vercel |

## Quick Start

```bash
# Clone
git clone https://github.com/cryptoriot666/mantlic.git
cd mantlic

# Install
npm install

# Run locally
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```env
# Required
DEEPSEEK_API_KEY=sk-...           # DeepSeek API key

# Optional
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # WalletConnect (demo mode works without)
```

## Submission

- **Live App:** [mantlic.vercel.app](https://mantlic.vercel.app)
- **GitHub:** [github.com/cryptoriot666/mantlic](https://github.com/cryptoriot666/mantlic)
- **Track:** Consumer & Viral DApps
- **Contract:** Mantle Sepolia — verify at explorer links above

---

Built for the Mantle Turing Test Hackathon 2026
