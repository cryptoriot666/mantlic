/**
 * Mantlic Deployment Script
 * Deploys all contracts to Mantle Sepolia testnet
 * 
 * Usage: npx hardhat run scripts/deploy.ts --network mantle-sepolia
 */

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy MantlicAgentRegistry (ERC-8004)
  console.log("\n1. Deploying MantlicAgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("MantlicAgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("   AgentRegistry deployed to:", agentRegistryAddress);

  // Deploy MantlicSwap
  console.log("\n2. Deploying MantlicSwap...");
  const MantlicSwap = await ethers.getContractFactory("MantlicSwap");
  const mantlicSwap = await MantlicSwap.deploy(deployer.address, 30); // 0.3% fee
  await mantlicSwap.waitForDeployment();
  const mantlicSwapAddress = await mantlicSwap.getAddress();
  console.log("   MantlicSwap deployed to:", mantlicSwapAddress);

  // Verify on explorer
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Mantle Sepolia Explorer: https://explorer.sepolia.mantle.xyz");
  console.log("\nContract Addresses:");
  console.log("  AGENT_REGISTRY:", agentRegistryAddress);
  console.log("  MANTLIC_SWAP:", mantlicSwapAddress);
  console.log("\nUpdate your src/lib/contracts.ts with these addresses.");

  // Save addresses to file
  const fs = require("fs");
  const path = require("path");
  const addresses = {
    network: "mantle-sepolia",
    chainId: 5003,
    timestamp: new Date().toISOString(),
    contracts: {
      MantlicAgentRegistry: agentRegistryAddress,
      MantlicSwap: mantlicSwapAddress
    }
  };
  
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });