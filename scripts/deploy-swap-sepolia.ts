/**
 * MantlicSwap Deployment Script
 * Deploys MantlicSwap to Mantle Sepolia testnet
 * 
 * Usage: PRIVATE_KEY=0x... npx hardhat run scripts/deploy-swap-sepolia.ts --network mantle-sepolia
 */

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  
  const MantlicSwap = await ethers.getContractFactory("MantlicSwap");
  const swap = await MantlicSwap.deploy(deployer.address, 30); // 0.3% fee
  await swap.waitForDeployment();
  
  const address = await swap.getAddress();
  console.log("MantlicSwap deployed to:", address);
  
  // Log for verification
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Network: Mantle Sepolia (Chain ID: 5003)");
  console.log("Contract Address:", address);
  console.log("Deployer:", deployer.address);
  console.log("=============================\n");
}

main().catch(console.error);
