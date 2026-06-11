# Mantlic Smart Contracts — Deployment Guide
## Mantle Turing Test Hackathon 2026

> Complete deployment instructions for ERC-8004 Agent Registry, Benchmarking, and Swap contracts.

---

## Contracts Overview

| Contract | File | Points | Description |
|----------|------|--------|-------------|
| **MantlicAgentRegistry** | `MantlicAgentRegistry.sol` | 12 pts (Bazaar) | ERC-8004 Identity + Reputation + Validation |
| **MantlicSwap** | `MantlicSwap.sol` | 15 pts (Technical) | Decentralized swap execution |
| **Benchmarking** | (included in Registry) | 10 pts (Innovation) | On-chain AI agent benchmarking |

---

## Prerequisites

1. **Node.js 18+** and npm
2. **MetaMask** wallet with Mantle Sepolia configured
3. **Test MNT** from [Mantle Faucet](https://www.l2faucet.com/mantle)
4. **Remix IDE** or **Hardhat** for deployment

---

## Network Configuration

### Mantle Sepolia (Testnet)
```
Network Name: Mantle Sepolia Testnet
RPC URL: https://rpc.sepolia.mantle.xyz
Chain ID: 5003
Currency Symbol: MNT
Block Explorer: https://explorer.sepolia.mantle.xyz
```

### Mantle Mainnet
```
Network Name: Mantle
RPC URL: https://rpc.mantle.xyz
Chain ID: 5000
Currency Symbol: MNT
Block Explorer: https://explorer.mantle.xyz
```

---

## Option 1: Remix IDE Deployment

### Step 1: Open Remix IDE
Navigate to [https://remix.ethereum.org](https://remix.ethereum.org)

### Step 2: Create Contract Files
1. Create `MantlicAgentRegistry.sol` in Remix
2. Paste contents from `contracts/MantlicAgentRegistry.sol`
3. Create `MantlicSwap.sol` in Remix
4. Paste contents from `contracts/MantlicSwap.sol`

### Step 3: Install OpenZeppelin Dependencies
In Remix, add these imports at the top of each file:
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

### Step 4: Compile Contracts
1. Select **Solidity Compiler** tab
2. Set compiler version to **0.8.20+**
3. Click **Compile MantlicAgentRegistry.sol**
4. Click **Compile MantlicSwap.sol**
5. Verify no errors

### Step 5: Deploy MantlicAgentRegistry
1. Select **Deploy & Run Transactions** tab
2. **Environment:** Select **Injected Provider - MetaMask**
3. Connect MetaMask (ensure Mantle Sepolia network)
4. Click **Deploy** on MantlicAgentRegistry
5. Confirm transaction in MetaMask
6. Wait for confirmation
7. **Copy deployed address**

### Step 6: Deploy MantlicSwap
1. MantlicSwap constructor requires two parameters:
   - `_feeRecipient`: Your wallet address
   - `_feeBps`: Fee in basis points (e.g., 30 = 0.3%)
2. Click **Deploy** with these values
3. Confirm transaction
4. **Copy deployed address**

### Step 7: Verify Deployment
1. Go to [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)
2. Search for each contract address
3. Verify contract is visible

---

## Option 2: Hardhat Deployment

### Step 1: Setup
```bash
cd mantlic
npm install
```

### Step 2: Configure Hardhat
Update `hardhat.config.ts`:
```typescript
import { MantleSepolia } from "@mantleio/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    "mantle-sepolia": {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
```

### Step 3: Deploy
```bash
npx hardhat run scripts/deploy.ts --network mantle-sepolia
```

### Step 4: Run Tests
```bash
npx hardhat test test/contracts.test.ts --network mantle-sepolia
```

---

## Contract Addresses (Update After Deployment)

Update `src/lib/contracts.ts`:
```typescript
export const CONTRACTS = {
  // ERC-8004 Agent Registry - DEPLOYED
  AGENT_REGISTRY: 'YOUR_AGENT_REGISTRY_ADDRESS' as const,
  
  // MantlicSwap - DEPLOYED
  MANTLIC_SWAP: 'YOUR_MANTLIC_SWAP_ADDRESS' as const,
  
  // Mantle DeFi
  CAMELOT_ROUTER: '0x0000000000000000000000000000000000000000' as const,
} as const
```

---

## Contract Interactions

### Register an Agent (ERC-8004)
```javascript
// Via ethers.js
const registry = await ethers.getContractAt(
  "MantlicAgentRegistry",
  "YOUR_AGENT_REGISTRY_ADDRESS"
);

const tx = await registry.registerAgent(
  "Mantlic Alpha", // name
  "ipfs://QmAgent001",      // metadataURI
  "0x" + "00".repeat(32)    // capabilities
);

const receipt = await tx.wait();
const agentId = await registry.getAgentByAddress(wallet.address);
console.log("Agent ID:", agentId);
```

### Record Benchmark Result
```javascript
await registry.recordBenchmark(
1,                          // agentId
  "dex_arbitrage", // benchmarkType
  8500,                      // score (85%)
150,                       // latencyMs
  ethers.parseEther("0.05"), // gasCost
  "ipfs://benchmark1"        // metadataURI
);
```

### Execute Swap
```javascript
const swap = await ethers.getContractAt(
  "MantlicSwap",
  "YOUR_MANTLIC_SWAP_ADDRESS"
);

// Get quote
const [expected, minOut] = await swap.getQuote(
  MNT_TOKEN,
  USDC_TOKEN,
  ethers.parseEther("1"),
  50 // 0.5% slippage
);

// Execute swap
const tx = await swap.executeSwap(
  MNT_TOKEN,
  USDC_TOKEN,
  ethers.parseEther("1"),
  minOut,
  "0x"
);
```

---

## Testing the Contracts

### Manual Testing in Remix

1. **registerAgent**: Register a new agent
2. **getAgent**: Retrieve agent details
3. **updateReputation**: Update agent score
4. **attestAgent**: Create trust attestation
5. **recordBenchmark**: Record benchmark result
6. **getTopAgentsByBenchmark**: Get leaderboard
7. **executeSwap**: Execute token swap
8. **getQuote**: Get swap quote

### Automated Testing
```bash
npx hardhat test
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Get test MNT from faucet |
| "Wrong network" | Switch MetaMask to Mantle Sepolia |
| "Transaction failed" | Increase gas limit in MetaMask |
| "Contract not responding" | Verify contract address is correct |
| "Already registered" | Agent already registered for this wallet |
| "Import errors" | Add OpenZeppelin imports in Remix |

---

## Support

- Mantle Discord: https://discord.gg/mantle
- Mantle Docs: https://docs.mantle.xyz
- Faucet: https://www.l2faucet.com/mantle
- Hackathon: https://dorahacks.io/hackathon/mantleturingtesthackathon2026

---

## Contract Summary

### MantlicAgentRegistry (ERC-8004)
- ✅ Identity Registry (ERC-721 NFT)
- ✅ Reputation Registry (scoring system)
- ✅ Validation Registry (attestations)
- ✅ On-chain Benchmarking (leaderboard)
- ✅ Voting support (ERC-721Votes)

### MantlicSwap
- ✅ Token swap execution
- ✅ Slippage protection
- ✅ Fee management
- ✅ Price tracking
- ✅ Reentrancy protection

---

**Built for the Mantle Turing Test Hackathon 2026**
**Total Points Potential: 37 pts (12 + 10 + 15)**
