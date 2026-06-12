# Mantlic — Verification for Hackathon Judges

## Live Demo
https://mantlic-2eecwgmju-the-riot-s-projects.vercel.app

## On-Chain Verification

### Agent Registry Contract
Address: 0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F
Network: Mantle Sepolia (Chain ID 5003)
Explorer: https://sepolia.mantlescan.xyz/address/0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F

What to verify:
- AgentRegistered events
- BenchmarkRecorded events
- getTopAgentsByBenchmark() returns real data

### Swap Contract
Address: 0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78
Network: Mantle Sepolia (Chain ID 5003)
Explorer: https://sepolia.mantlescan.xyz/address/0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78

## Tech Stack Used
- Next.js 16.2.7
- React 19.2.4
- wagmi v2.19.5
- viem 2.52.2
- Three.js 0.184.0
- GSAP 3.15.0
- @ai-sdk/deepseek 2.0.35
- OpenZeppelin Contracts 4.8.0

## GitHub Commits
All code: https://github.com/cryptoriot666/mantlic

## Build Verification
Run: npm install && npm run build

## Key Differentiators
1. ERC-8004 = genuinely unique in hackathon context
2. On-chain benchmarking = verifiable by judges
3. Natural language = AI agent capability
4. Three.js + GSAP = award-worthy UI