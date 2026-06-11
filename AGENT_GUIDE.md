# Mantlic Agent Guide — Minds Bazaar Submission

## Overview
Mantlic is an autonomous AI trading agent for Mantle DeFi. It uses natural language commands to execute swaps, check yields, and manage portfolios — all through an ERC-8004 compliant agent identity.

## How It Works

### Agent Identity (ERC-8004)
Every Mantlic agent has a unique on-chain identity:
- Token ID = Agent ID
- Reputation score tracked on-chain
- Attestations from other agents
- Benchmark scores for performance verification

**Contract:** `0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F` (Mantle Sepolia)

### Natural Language Commands
```
swap 100 MNT for USDC    → Execute token swap
balance                  → Show wallet balances  
yield                    → Compare DeFi yields
register agent           → Register on-chain identity
benchmark dex_arbitrage  → Record performance score
help                     → Show all commands
```

### DeFi Integration
- **1inch Fusion API** — Aggregated swaps across all Mantle DEXs
- **Mantle Sepolia** — Testnet for demo (no real money)
- **Mantle Mainnet** — Real execution with full gas

## Technical Architecture

### Smart Contracts
| Contract | Address | Points |
|----------|---------|--------|
| MantlicAgentRegistry | 0x59f1...1a1F | 12 (Bazaar) |
| Benchmarking | included | 10 (Innovation) |
| MantlicSwap | TBD | 15 (Technical) |

### Frontend
- Next.js 16 + React 19
- wagmi v2 + RainbowKit
- Three.js particle background
- GSAP animations
- @ai-sdk/deepseek for AI chat

### Agent Memory
Stored locally per wallet address:
- Interaction history
- Command preferences
- Custom strategies
- Benchmark results

## Demo Flow
1. Connect wallet (MetaMask/Coinbase/WalletConnect)
2. Type commands in terminal
3. Watch on-chain execution
4. Share referral link

## Submission Links
- **Live App:** https://mantlic.vercel.app
- **GitHub:** https://github.com/cryptoriot666/mantlic
- **Demo Video:** [YouTube link]
- **Contract:** 0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F

## Judge Notes
- 37 pts total (12 + 10 + 15)
- ERC-8004 agent identity = real blockchain, not mock
- Benchmarking = on-chain performance verification
- Natural language = AI agent capability
- GSAP + Three.js = award-worthy UI
