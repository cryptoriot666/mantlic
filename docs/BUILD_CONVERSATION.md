# Mantlic Build Conversation

## Timeline

### Phase 1: Smart Contracts (ERC-8004)
Built ERC-8004 compliant agent registry with:
- On-chain identity NFT
- Reputation tracking
- Benchmark scoring
- Attestation system

### Phase 2: Frontend (Next.js 16 + React 19)
Built chat-first AI agent interface with:
- RainbowKit wallet connection
- DeepSeek AI chat
- Natural language command parsing
- TradeCard viral sharing
- Leaderboard

### Phase 3: Animations (Three.js + GSAP)
Added award-worthy animations:
- Three.js particle background
- GSAP ScrollTrigger
- Micro-interactions (ripple, glow)
- Counter animations

### Phase 4: Part B (Telegram + Bazaar)
Built Telegram bot + Minds Bazaar integration.

## Technical Decisions

1. Why ERC-8004? Verifiable on-chain identity = trust
2. Why terminal UX? Trader preference for speed
3. Why DeepSeek? Cost-effective AI with good reasoning
4. Why Mantle? Low fees + fast finality

## Challenges Solved

1. Remix + OKX Wallet = switched to MetaMask
2. Mantle Sepolia read-only = used Mantle Mainnet for execution
3. Hardhat + Next.js conflict = separate configs
4. OZ v5 + Hardhat 2 = downgraded to OZ v4

## Key Files
- contracts/MantlicAgentRegistry.sol — ERC-8004 implementation
- src/app/page.tsx — Main chat interface
- src/bot/telegram-bot.ts — Telegram bot
- docs/BUILD_CONVERSATION.md — This file