const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  
  // Deploy fresh AgentRegistry
  const Registry = await ethers.getContractFactory('MantlicAgentRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log('AgentRegistry deployed to:', registryAddr);
  
  // Register Mantlic agent
  console.log('\n--- Registering Mantlic-Alpha ---');
  const tx = await registry.registerAgent(
    'Mantlic-Alpha',
    'ipfs://QmMantlicAlpha001',
    ethers.toUtf8Bytes('swap,yield,portfolio,benchmark')
  );
  const receipt = await tx.wait();
  console.log('TX:', tx.hash);
  console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
  
  // Get agent
  const agentId = await registry.getAgentByAddress(deployer.address);
  console.log('Agent ID:', agentId.toString());
  const agent = await registry.getAgent(agentId);
  console.log('Name:', agent.name);
  console.log('Owner:', agent.owner);
  console.log('Capabilities:', ethers.toUtf8String(agent.capabilities));
  
  // Update reputation to set benchmark score
  console.log('\n--- Updating Benchmark Score ---');
  await registry.updateReputation(agentId, 8900); // DEX score
  console.log('Reputation updated to 8900');
  
  // Read back
  const rep = await registry.getReputationScore(agentId);
  console.log('Final reputation:', rep.toString());
  
  console.log('\n=== COMPLETE ===');
  console.log('Registry:', registryAddr);
  console.log('Agent ID:', agentId.toString());
  console.log('TX:', tx.hash);
  console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + tx.hash);
}

main().catch(console.error);
