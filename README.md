# Mantlic — Terminal for DeFi on Mantle

> One chat. Every protocol. No fluff.

[![Hackathon](https://img.shields.io/badge/Mantle-Turing%20Test%20Hackathon%202026-00AEEF?style=for-the-badge)](https://dorahacks.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## What is Mantlic?

Mantlic is an autonomous AI trading agent for Mantle DeFi. Natural language commands → on-chain execution. ERC-8004 agent identity on Mantle.

**Live Demo: [mantlic-2eecwgmju-the-riot-s-projects.vercel.app](https://mantlic-2eecwgmju-the-riot-s-projects.vercel.app)**

## Philosophy

- **Direct**: Ask. Execute. Done.
- **Fast**: Low fees. Fast finality. Real DeFi.
- **Honest**: No fluff. No promises. Just data.

## Commands

```
swap 100 MNT for USDC    → Execute token swap (via 1inch Fusion)
balance                   → Show wallet balances
yield                     → Compare DeFi yields (Agni/Merchant Moe)
leaderboard               → Agent rankings
register agent <name>    → Register on-chain identity
benchmark dex_arbitrage  → Record performance score
help                     → Show all commands
```

## Architecture

```
Mantlic
├── Frontend: Next.js 16 + React 19 + Tailwind CSS v4
├── Wallet: wagmi v2 + RainbowKit + viem
├── AI: DeepSeek via @ai-sdk/deepseek
├── Animations: Three.js (particles) + GSAP (scroll, micro-interactions)
├── Chain: Mantle Sepolia (testnet) / Mantle Mainnet
└── Agent Identity: ERC-8004 NFT (on-chain)
```

## Smart Contracts — DEPLOYED

| Contract | Address | Network | Points |
|----------|---------|---------|--------|
| MantlicAgentRegistry | `0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F` | Mantle Sepolia | 12 (Bazaar) |
| Benchmarking | (included in Registry) | Mantle Sepolia | 10 (Innovation) |
| MantlicSwap | `0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78` | Mantle Sepolia | 15 (Technical) |

**Total: 37 pts**

**Explorer:** [Mantle Sepolia Explorer](https://sepolia.mantlescan.xyz/address/0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F)

## ERC-8004 Implementation

Mantlic implements **ERC-8004** — the standard for AI Agent Registry on-chain identity:

### Agent Identity NFT
- Each AI agent gets a unique on-chain identity as an NFT
- Ownership recorded on Mantle Sepolia
- Metadata includes agent name, creation timestamp, and reputation score

### On-Chain Benchmarking
- Every benchmark score recorded on-chain
- Leaderboard queryable by benchmark type
- Performance verification verifiable by anyone

### Contract Interface

```solidity
interface IAgentRegistry {
    function registerAgent(string calldata name, string calldata metadataURI, bytes calldata capabilities) returns (uint256);
    function getAgent(uint256 agentId) returns (Agent memory);
    function recordBenchmark(uint256 agentId, string calldata benchmarkType, uint256 score, uint256 latencyMs, uint256 costGas, string calldata metadataURI);
    function getTopAgentsByBenchmark(string calldata benchmarkType, uint256 limit) returns (uint256[] memory);
}
```

## DeFi Integration

- **1inch Fusion API** — Aggregated swaps across all Mantle DEXs
- **Agni Finance** — Real yield data
- **Merchant Moe** — LP opportunities
- **Mantle Sepolia** — Testnet (no real money)
- **Mantle Mainnet** — Real execution

## Quick Start

```bash
# Clone and install
git clone https://github.com/cryptoriot666/mantlic.git
cd mantlic
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
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # WalletConnect
NEXT_PUBLIC_1INCH_API_KEY=...             # 1inch Fusion
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Wallet | wagmi v2 + RainbowKit + viem |
| Blockchain | Mantle Sepolia / Mainnet |
| AI | DeepSeek via @ai-sdk/deepseek |
| Animations | Three.js + GSAP |
| Hosting | Vercel |

## Hackathon Submission

- **Live App:** [mantlic.vercel.app](https://mantlic.vercel.app)
- **GitHub:** [github.com/cryptoriot666/mantlic](https://github.com/cryptoriot666/mantlic)
- **Demo Video:** Record a 2-minute demo using OBS or Loom (1080p), export as MP4, upload to YouTube (unlisted works), paste the YouTube link here
- **Contracts:** Mantle Sepolia explorer (see table above)
- **Judge Verification:** [docs/GITHUB_VERIFICATION.md](docs/GITHUB_VERIFICATION.md) — Complete verification guide for judges with on-chain proof and tech stack details

## Screenshots

To capture screenshots for the submission:
1. **Landing Page**: Open [mantlic.vercel.app](https://mantlic.vercel.app), capture the hero section with particle animation
2. **Wallet Connected**: Connect MetaMask, capture the terminal interface with connected wallet state
3. **Command Execution**: Type "balance" or "yield", capture the AI response
4. **TradeCard**: After a swap, capture the shareable TradeCard modal
5. **Leaderboard**: Type "leaderboard", capture the agent rankings

Use lightshot, Greenshot, or system screenshot tool. Save as PNG, add to docs/screenshots/ folder.

---

Built for the Mantle Turing Test Hackathon 2026
