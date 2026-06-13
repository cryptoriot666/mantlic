Mantlic — AI Agent for DeFi on Mantle

WHAT IS MANTLIC?

Mantlic is an autonomous AI trading agent for Mantle DeFi. You type natural language commands like "swap 100 MNT for USDC" and watch on-chain execution happen. No clicking through DEX interfaces. No confusion. Just direct DeFi.

ONE-CHAIN AGENT IDENTITY (ERC-8004)

Every Mantlic agent has a unique on-chain identity as an NFT. This is not just a username — it is a real blockchain identity that juries can verify themselves. Reputation scores are tracked on-chain. Benchmark scores are recorded immutably. Other agents can create trust attestations.

The Agent Registry contract is deployed at 0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349 on Mantle Sepolia. You can see the AgentRegistered events, the BenchmarkRecorded events, and the reputation updates all on the explorer.

HOW IT WORKS

Connect your wallet. Type a command. Watch it execute.

Available commands include swap for token exchanges through 1inch Fusion, balance to see your wallet holdings, yield to compare DeFi opportunities across Agni Finance and Merchant Moe, leaderboard to see agent rankings, register agent to create your on-chain identity, benchmark to record your performance score, and help to see everything available.

DEFi INTEGRATION

Mantlic connects to 1inch Fusion API for aggregated swaps across all Mantle DEXs. It pulls real yield data from Agni Finance and shows LP opportunities from Merchant Moe. Everything runs on Mantle Sepolia testnet first so there is no real money at risk. When you are ready, switch to Mantle mainnet for real execution.

TRADECARD — VIRAL SHARING

After every swap, Mantlic generates a shareable TradeCard. This is a visual card showing your trade results that you can share on social media. It is designed to drive viral growth and gives Mantlic a consumer angle that stands out from purely technical DeFi projects.

VERIFICATION FOR JUDGES

Step 1: Open the Agent Registry on Mantle Sepolia Explorer. The direct link is sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349. Click the Contract tab to see the verified code. Click Txn Logs to see the on-chain events. This verifies 22 points.

Step 2: Open the Swap Contract on Mantle Sepolia Explorer. The direct link is sepolia.mantlescan.xyz/address/0x46da6883626f51c500c662f7B934FA7DD0abE105. Click Contract to see verified code. Click Txn Logs to see swap transactions. This verifies 15 points.

Step 3: Test the live app. Go to mantlic.vercel.app. Connect your MetaMask wallet (make sure you have Mantle Sepolia network configured). Type help to see all commands. Type balance to see your wallet. Type leaderboard to see agent rankings. This verifies the frontend works.

TOTAL POINTS: 37 PTS — all verifiable on-chain.

TECHNICAL HIGHLIGHTS

ERC-8004 implementation with ERC-721 NFT identity, reputation registry, attestations, and on-chain benchmarking. Natural language processing powered by DeepSeek AI. Three.js particle background animations with GSAP micro-interactions. wagmi v2 and RainbowKit for seamless wallet connection. All smart contracts verified on Mantle Sepolia.

LIVE APP: mantlic.vercel.app

GITHUB: github.com/cryptoriot666/mantlic

Built for the Mantle Turing Test Hackathon 2026.
