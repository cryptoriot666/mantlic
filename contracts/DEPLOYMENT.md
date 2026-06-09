# ERC-8004 Contract Deployment Guide

This guide walks you through deploying the Mantlic Agent Registry contract to Mantle Sepolia testnet.

## Prerequisites

1. **MetaMask** wallet installed
2. **Mantle Sepolia** network added to MetaMask
3. **Test MNT** tokens from [Mantle Faucet](https://www.l2faucet.com/mantle)
4. Remix IDE: [https://remix.ethereum.org](https://remix.ethereum.org)

## Step 1: Add Mantle Sepolia to MetaMask

**Network Name:** Mantle Sepolia Testnet
**RPC URL:** `https://rpc.sepolia.mantle.xyz`
**Chain ID:** `5003`
**Currency Symbol:** `MNT`
**Block Explorer:** `https://explorer.sepolia.mantle.xyz`

## Step 2: Get Test MNT

1. Go to [https://www.l2faucet.com/mantle](https://www.l2faucet.com/mantle)
2. Connect your wallet
3. Request test tokens (may take a few minutes)

## Step 3: Open Remix IDE

1. Go to [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file: `MantlicAgentNFT.sol`

## Step 4: Paste the Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MantlicAgentNFT
 * @dev ERC-8004 inspired Agent Registry Contract
 * @notice Implements on-chain AI agent identity and decision logging
 */
contract MantlicAgentNFT {
    // Agent data structure
    struct Agent {
        address owner;
        string agentName;
        string metadataURI;
        uint256 createdAt;
        uint256 decisionsCount;
    }
    
    // Decision log structure
    struct Decision {
        uint256 agentId;
        string action;
        string result;
        uint256 confidence;
        uint256 timestamp;
    }
    
    // State variables
    uint256 public totalAgents;
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Decision[]) public decisionLogs;
    
    // Events
    event AgentRegistered(uint256 indexed agentId, address indexed owner, string agentName);
    event DecisionLogged(uint256 indexed agentId, uint256 indexed decisionId, string action, uint256 confidence);
    
    /**
     * @dev Register a new AI agent
     * @param agentName Name of the agent
     * @param metadataURI IPFS URI for agent metadata
     * @return agentId The ID of the newly registered agent
     */
    function registerAgent(string calldata agentName, string calldata metadataURI) external returns (uint256) {
        require(bytes(agentName).length > 0, "Agent name required");
        
        uint256 agentId = totalAgents++;
        agents[agentId] = Agent({
            owner: msg.sender,
            agentName: agentName,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            decisionsCount: 0
        });
        
        emit AgentRegistered(agentId, msg.sender, agentName);
        return agentId;
    }
    
    /**
     * @dev Get agent details
     * @param agentId The ID of the agent
     * @return Agent struct with all details
     */
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        require(agentId < totalAgents, "Agent does not exist");
        return agents[agentId];
    }
    
    /**
     * @dev Log a decision made by an agent
     * @param agentId The ID of the agent
     * @param action The action taken
     * @param result The result of the action
     * @param confidence Confidence score (0-10000 =0-100%)
     * @return decisionId The ID of the logged decision
     */
    function logDecision(
        uint256 agentId,
        string calldata action,
        string calldata result,
        uint256 confidence
    ) external returns (uint256) {
        require(agentId < totalAgents, "Agent does not exist");
        require(agents[agentId].owner == msg.sender, "Not the agent owner");
        require(confidence <= 10000, "Confidence must be 0-10000");
        
        uint256 decisionId = decisionLogs[agentId].length;
        decisionLogs[agentId].push(Decision({
            agentId: agentId,
            action: action,
            result: result,
            confidence: confidence,
            timestamp: block.timestamp
        }));
        
        agents[agentId].decisionsCount++;
 emit DecisionLogged(agentId, decisionId, action, confidence);
        return decisionId;
    }
    
    /**
     * @dev Get decision count for an agent
     * @param agentId The ID of the agent
     * @return Number of decisions logged
     */
    function getDecisionCount(uint256 agentId) external view returns (uint256) {
        return decisionLogs[agentId].length;
    }
    
    /**
     * @dev Get a specific decision
     * @param agentId The ID of the agent
     * @param decisionId The ID of the decision
     * @return Decision struct
     */
    function getDecision(uint256 agentId, uint256 decisionId) external view returns (Decision memory) {
        require(decisionId < decisionLogs[agentId].length, "Decision does not exist");
        return decisionLogs[agentId][decisionId];
    }
}
```

## Step 5: Compile the Contract

1. In Remix, select the **Solidity Compiler** tab (left sidebar)
2. Set compiler version to **0.8.20+**
3. Click **Compile MantlicAgentNFT.sol**
4. Verify no errors in the console

## Step 6: Deploy the Contract

1. Select **Deploy & Run Transactions** tab
2. **Environment:** Select **Injected Provider - MetaMask**
3. Connect MetaMask when prompted
4. Ensure you're on Mantle Sepolia network
5. Click **Deploy**
6. Confirm the transaction in MetaMask
7. Wait for transaction confirmation

## Step 7: Update Configuration

1. Copy the deployed contract address from Remix
2. Update `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  AGENT_REGISTRY: 'YOUR_DEPLOYED_ADDRESS_HERE' as const,
  DECISION_LOGGER: 'YOUR_DEPLOYED_ADDRESS_HERE' as const,
  // ...
}
```

3. Update `scripts/deploy-contracts.ts` with the real address

## Step 8: Verify Deployment

1. Go to [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)
2. Search for your contract address
3. Verify contract is visible and interactions work

## Contract Verification (Optional)

1. In Remix, go to **Deploy & Run Transactions**
2. Expand your deployed contract
3. Click the **ABI** button to copy the ABI
4. Go to [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)
5. Navigate to your contract
6. Click **Verify & Publish**
7. Paste ABI and contract source code
8. Submit verification

## Testing the Contract

After deployment, test these functions:

1. **registerAgent**: Register a new agent
2. **getAgent**: Retrieve agent details
3. **logDecision**: Log a decision with confidence score
4. **getDecisionCount**: Check decision count
5. **getDecision**: Retrieve a specific decision

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Get test MNT from faucet |
| "Wrong network" | Switch MetaMask to Mantle Sepolia |
| "Transaction failed" | Increase gas limit in MetaMask |
| Contract not responding | Verify contract address is correct |

## Support

- Mantle Discord: https://discord.gg/mantle
- Mantle Docs: https://docs.mantle.xyz
- Faucet: https://www.l2faucet.com/mantle
