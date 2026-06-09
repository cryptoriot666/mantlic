# Mantlic — Terminal for DeFi

> One chat. Every protocol. No fluff.

[![Hackathon](https://img.shields.io/badge/Mantle-Turing%20Test%20Hackathon%202026-00AEEF?style=for-the-badge)](https://dorahacks.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## What is Mantlic?

Mantlic is a terminal-style interface for DeFi on Mantle. No flashy graphics. No marketing speak. Just commands.

**Demo: [mantlic.vercel.app](https://mantlic.vercel.app)**

## Philosophy

- **Direct**: Ask. Execute. Done.
- **Fast**: Low fees. Fast finality. Real DeFi.
- **Honest**: No fluff. No promises. Just data.

## Commands

```
$ balance          → your MNT balance
$ send 0.01 MNT to 0x... → transfer
$ yield            → best DeFi yields
$ address          → your wallet address
```

## Architecture

```
Mantlic
├── Frontend: Next.js 16 + React 19 + Tailwind CSS
├── Wallet: wagmi v2 + RainbowKit + viem
├── AI: OpenAI GPT-4o-mini via Vercel AI SDK
├── Chain: Mantle Sepolia (testnet) / Mantle Mainnet
└── Agent Identity: ERC-8004 NFT (on-chain)
```

## ERC-8004 Implementation

Mantlic implements **ERC-8004** - the standard for AI Agent Registry on-chain identity. This enables:

### Agent Identity NFT
- Each AI agent gets a unique on-chain identity as an NFT
- Ownership recorded on Mantle Sepolia (testnet)
- Metadata includes agent name, creation timestamp, and decision history

### On-Chain Decision Logging
- Every agent decision is logged to the blockchain
- Each decision records: action taken, result, confidence score
- Creates auditable trail for agent behavior

### Contract Interface

```solidity
// ERC-8004 Agent Registry
interface IAgentRegistry {
    function registerAgent(string memory agentName, string memory metadataURI) returns (uint256);
    function getAgent(uint256 agentId) returns (Agent memory);
    function logDecision(uint256 agentId, string memory action, string memory result, uint256 confidence) returns (uint256);
    function totalAgents() returns (uint256);
}
```

### Deployment Status

| Contract | Status | Address |
|----------|--------|---------|
| Agent Registry | Pending Deployment | `0x0000000000000000000000000000000000000001` |
| Decision Logger | Pending Deployment | `0x0000000000000000000000000000000000000002` |

**For Judges**: See [contracts/DEPLOYMENT.md](./contracts/DEPLOYMENT.md) for step-by-step deployment instructions.

## Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/mantlic.git
cd mantlic
npm install

# Configure
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local

# Run
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...          # OpenAI API key

# Optional  
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # WalletConnect
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Wallet | wagmi v2 + RainbowKit |
| Blockchain | viem + Mantle SDK |
| AI | OpenAI GPT-4o-mini |
| Hosting | Vercel |

## License

MIT - see [LICENSE](./LICENSE)

---

Built for the Mantle Turing Test Hackathon 2026
