# Mantle Deployment Guide

## MantlicAgentNFT Deployment

### Mantle Sepolia Testnet
- Network: Mantle Sepolia
- Chain ID: 5003
- RPC: https://rpc.sepolia.mantle.xyz
- Explorer: https://explorer.sepolia.mantle.xyz

### Deployment Steps
1. Go to https://remix.ethereum.org
2. Compile MantlicAgentNFT.sol (Solidity 0.8.20+)
3. Deploy with Injected Provider (MetaMask)
4. Network: Mantle Sepolia (Chain ID 5003)
5. Fund deployer with MNT from faucet: https://www.l2faucet.com/mantle

### Contract Address (Update after deployment)
After deployment, update /src/lib/contracts.ts with the deployed address.

### Verify Contract
1. Go to https://explorer.sepolia.mantle.xyz
2. Search your contract address
3. Read totalAgents() to verify deployment
