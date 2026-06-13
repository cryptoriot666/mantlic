# Mantlic Agent Guide — Hackathon Submission

## Overview
Mantlic is an autonomous AI trading agent for Mantle DeFi. Natural language commands → on-chain execution. ERC-8004 agent identity on Mantle Sepolia.

**Live App:** https://mantlic.vercel.app
**GitHub:** https://github.com/cryptoriot666/mantlic

## How It Works

### Agent Identity (ERC-8004)
Every Mantlic agent has a unique on-chain identity on Mantle Sepolia:
- Token ID = Agent ID
- Reputation score tracked on-chain
- Attestations from other agents
- Benchmark scores for performance verification

**Agent Registry:** `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349` (Mantle Sepolia)
**Swap Contract:** `0x46da6883626f51c500c662f7B934FA7DD0abE105` (Mantle Sepolia)

### Natural Language Commands
```
swap 100 MNT for USDC    → Execute token swap (via 1inch Fusion)
balance                   → Show wallet balances
yield                    → Compare DeFi yields (Agni Finance, Merchant Moe)
leaderboard              → Show agent rankings
register agent <name>   → Register on-chain identity
benchmark dex_arbitrage  → Record performance score
help                     → Show all commands
```

### DeFi Integration
- **1inch Fusion API** — Aggregated swaps across all Mantle DEXs
- **Agni Finance** — Real yield data
- **Merchant Moe** — LP opportunities
- **Mantle Sepolia** — Testnet (no real money, no risk)
- **Mantle Mainnet** — Real execution with gas

## Technical Architecture

### Smart Contracts — DEPLOYED
| Contract | Address | Network | Points |
|----------|---------|---------|--------|
| MantlicAgentRegistry | `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349` | Mantle Sepolia | 12 (Bazaar) |
| Benchmarking | (in Registry) | Mantle Sepolia | 10 (Innovation) |
|| MantlicSwap | `0x46da6883626f51c500c662f7B934FA7DD0abE105` | Mantle Sepolia | 15 (Technical) |

**Total: 37 pts** — verifiable on-chain

### Frontend
- Next.js 16 + React 19 + Tailwind CSS v4
- wagmi v2 + RainbowKit + viem
- Three.js particle background (subtle, performant)
- GSAP animations (scroll-triggered, micro-interactions)
- DeepSeek AI chat

### Agent Memory
Stored per wallet address:
- Interaction history
- Command preferences
- Custom strategies
- Benchmark results

## Demo Flow
1. Connect wallet (MetaMask/Coinbase/WalletConnect)
2. Type natural language command
3. Watch on-chain execution or data retrieval
4. Share results via TradeCard

## Key Differentiators

### 1. ERC-8004 On-Chain Agent Identity
Not just a username — a real blockchain NFT. Juries can verify:
- Agent registration event on Mantle Sepolia Explorer
- Benchmark scores recorded immutably
- Reputation tracked on-chain

### 2. Natural Language to DeFi
No clicking through DEX UIs. Type "swap 100 MNT for USDC" → done.

### 3. Viral Consumer UX
- Shareable TradeCards after every swap
- Agent Leaderboard with rankings
- Referral tracking

### 4. Three.js + GSAP UI
Award-worthy animations that don't sacrifice performance.

## Judge Notes
- 37 pts verifiable on-chain (not mock)
- ERC-8004 = genuinely unique in hackathon context
- DeepSeek AI = working natural language
- TradeCard = viral/consumer angle for Track 4

## Submission Links
- **Live App:** https://mantlic.vercel.app
- **GitHub:** https://github.com/cryptoriot666/mantlic
- **Agent Registry:** https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349
- **Swap Contract:** https://sepolia.mantlescan.xyz/address/0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78
- **Demo Video:** Record a 2-minute demo using OBS or Loom (1080p minimum), export as MP4, upload to YouTube (unlisted works), paste the YouTube link

## Contract Verification
1. Open https://sepolia.mantlescan.xyz
2. Paste `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349`
3. See: AgentRegistered events, BenchmarkRecorded events, reputation updates
