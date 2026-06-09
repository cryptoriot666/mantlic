# Mantlic - AI Agent Wallet on Mantle

> Conversational AI agent wallet for Mantle. Click, chat, done.

[![Hackathon](https://img.shields.io/badge/Mantle-Turing%20Test%20Hackathon%202026-00AEEF?style=for-the-badge)](https://dorahacks.io)
[![Track](https://img.shields.io/badge/Track-Agentic%20Wallets%20%26%20Economy-purple?style=flat-square)](https://dorahacks.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## What is Mantlic?

Mantlic is an AI-powered agent wallet that lets users manage their Mantle crypto holdings through natural conversation. Instead of navigating complex DeFi interfaces, users simply tell Mantlic what they want to do.

**Demo: [mantlic.vercel.app](https://mantlic.vercel.app)**

## Features

### 🤖 AI-Powered Chat Interface
Natural language commands for wallet operations. "What's my balance?", "Send 0.1 MNT to 0x...", "Show my address"

### 🔐 Non-Custodial Security
You control your keys. Every transaction requires explicit wallet confirmation.

### 🏷️ ERC-8004 Agent Identity
Every AI agent gets a unique on-chain identity NFT, establishing reputation and tracking transaction history permanently on Mantle.

### 🔗 Mantle Native
Built for Mantle L2 - low fees, fast confirmations, EVM compatible.

## Architecture

```
Mantlic
├── Frontend: Next.js 16 + React 19 + Tailwind CSS
├── Wallet: wagmi v2 + RainbowKit + viem
├── AI: OpenAI GPT-4o-mini via Vercel AI SDK
├── Chain: Mantle Sepolia (testnet) / Mantle Mainnet
└── Agent Identity: ERC-8004 NFT (on-chain)
```

## Quick Start

\`\`\`bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/mantlic.git
cd mantlic

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
\`\`\`

## Environment Variables

\`\`\`env
# Required
OPENAI_API_KEY=sk-...          # OpenAI API key for AI chat

# Optional  
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # WalletConnect project ID
\`\`\`

## How It Works

1. **Connect Wallet** - Click "Connect Wallet" and select MetaMask or WalletConnect
2. **Chat with Mantlic** - Ask questions or give commands in natural language
3. **Confirm Transactions** - Every write transaction requires wallet signature
4. **Agent Identity** - Mint your AI agent as an on-chain ERC-8004 NFT

### Supported Commands

- \`What's my balance?\` - Check wallet MNT balance
- \`Send 0.01 MNT to 0x...\` - Transfer MNT to any address  
- \`Show my address\` - Display wallet address
- \`Who are you?\` - Learn about Mantlic

## Hackathon Submission

- **Track**: Agentic Wallets & Economy
- **Event**: Mantle Turing Test Hackathon 2026
- **Prize Pool**: $120,000 USD
- **Deadline**: Submit via [DoraHacks](https://dorahacks.io)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Wallet | wagmi v2 + RainbowKit |
| Blockchain | viem + Mantle SDK |
| AI | OpenAI GPT-4o-mini |
| Streaming | Vercel AI SDK |
| Hosting | Vercel |

## Key Innovations

1. **Conversational DeFi** - First AI agent wallet on Mantle with natural language interface
2. **ERC-8004 Compliance** - On-chain agent identity standard for transparent AI operations
3. **Non-Custodial Safety** - User keys never leave wallet; AI only proposes, user approves

## Screenshots

```
[Connect Wallet] → [Chat with AI] → [Confirm Transaction] → [Done]
```

## License

MIT License - see [LICENSE](./LICENSE)

---

Built with 💜 for the Mantle Turing Test Hackathon 2026
