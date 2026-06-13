const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Registering Mantlic agent from:', deployer.address);
  
  // Agent Registry
  const registry = await ethers.getContractAt('MantlicAgentRegistry', '0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F');
  
  // Check if already registered
  try {
    const agentId = await registry.getAgentByAddress(deployer.address);
    console.log('Already registered as agent ID:', agentId.toString());
  } catch(e) {
    console.log('Not registered yet, registering...');
  }
  
  // Register Mantlic agent
  const tx = await registry.registerAgent(
    'Mantlic-Alpha',
    'ipfs://QmMantlicAlpha001',
    ethers.toUtf8Bytes('swap,yield,portfolio,benchmark')
  );
  
  const receipt = await tx.wait();
  console.log('Registration TX:', tx.hash);
  console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
  
  // Get agent ID
  const agentId = await registry.getAgentByAddress(deployer.address);
  console.log('Agent ID:', agentId.toString());
  
  // Get agent details
  const agent = await registry.getAgent(agentId);
  console.log('\nAgent Details:');
  console.log('  Name:', agent.name);
  console.log('  Owner:', agent.owner);
  console.log('  Reputation:', agent.reputation.toString());
  console.log('  Benchmark Score:', agent.benchmarkScore.toString());
  console.log('  Swap Volume:', ethers.formatEther(agent.swapVolume), 'MNT');
  console.log('  Trade Count:', agent.tradeCount.toString());
  
  console.log('\n=== REGISTRATION COMPLETE ===');
  console.log('Agent: Mantlic-Alpha');
  console.log('Agent ID:', agentId.toString());
  console.log('TX Hash:', tx.hash);
  console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + tx.hash);
}

main().catch(console.error);
