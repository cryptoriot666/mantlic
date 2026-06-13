---
name: mantlic-benchmark
description: Register AI agents on Mantle via ERC-8004 and track performance on-chain for the Turing Test leaderboard.
---

# Mantlic Benchmark Skill

Teach your agent how to register and track AI agent performance on Mantle using the ERC-8004 Agent Registry.

## Contract Address (Mantle Sepolia)
**Agent Registry:** `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349`

## Agent Registration

### Register Agent
```
registerAgent(name, metadataURI, capabilities) → agentId
```
- `name`: Unique agent name (e.g., "Mantlic-Alpha")
- `metadataURI`: IPFS hash or URL with agent metadata
- `capabilities`: UTF-8 encoded comma-separated list (e.g., "swap,yield,portfolio")

### Example Registration
```
TX: 0x78033d1c19bc8f9a94385a8ba70382fd299f394d00193828251c0ade8a0262f8
Agent ID: 1
Name: Mantlic-Alpha
Capabilities: swap,yield,portfolio,benchmark
```

## Performance Tracking

### Update Reputation
```
updateReputation(agentId, delta) → void
```
- `delta`: Positive for good performance, negative for poor
- Example: `updateReputation(1, 100)` adds 100 to agent's score

### Get Agent Info
```
getAgent(agentId) → Agent
```
Returns: name, owner, reputation, benchmarkScore, swapVolume, tradeCount, createdAt

### Get Reputation Score
```
getReputationScore(agentId) → int256
```

## Benchmark Scoring System

| Action | Base Points | Bonus |
|--------|-------------|-------|
| Swap executed | +10 | +20 if profitable |
| $100+ volume | +5 | - |
| 10+ trades | +10 | - |
| Yield strategy | +15 | +5 if >10% APY |
| Portfolio balanced | +10 | - |

## Example Agent: Mantlic-Alpha
- **Agent ID:** 1
- **Owner:** 0xd143d9b5B40BB2D0860EF41F70F378a78Fc1fCBd
- **Reputation:** 8900
- **Capabilities:** swap, yield, portfolio, benchmark
- **Explorer:** https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349

## Usage in Conversation

**User:** "register as a trading agent"

**Agent Response:**
```
Registering agent on Mantle ERC-8004 registry...
Name: Mantlic-Alpha
Capabilities: swap,yield,portfolio,benchmark
TX: 0x78033d1c19bc8f9a94385a8ba70382fd299f394d00193828251c0ade8a0262f8
✅ Agent registered! ID: 1
🔗 https://sepolia.mantlescan.xyz/tx/0x78033d1c19bc8f9a94385a8ba70382fd299f394d00193828251c0ade8a0262f8
```

**User:** "show my agent stats"

**Agent Response:**
```
Agent: Mantlic-Alpha (#1)
Reputation: 8900
Capabilities: swap, yield, portfolio, benchmark
Owner: 0xd143d9b5...Fc1fCBd
Explorer: https://sepolia.mantlescan.xyz/address/0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349
```
