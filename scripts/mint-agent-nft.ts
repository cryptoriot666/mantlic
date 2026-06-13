const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  
  // Deploy AgentNFT
  const AgentNFT = await ethers.getContractFactory('MantlicAgentNFT');
  const nft = await AgentNFT.deploy();
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();
  console.log('AgentNFT deployed to:', nftAddr);
  
  // Mint agent NFT for Mantlic-Alpha
  console.log('\n--- Minting Agent NFT ---');
  const mintTx = await nft.mintAgent('Mantlic-Alpha', 'ipfs://QmMantlicAlpha001');
  const receipt = await mintTx.wait();
  console.log('Mint TX:', mintTx.hash);
  console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
  
  // Check token balance
  const balance = await nft.balanceOf(deployer.address);
  console.log('NFT balance:', balance.toString());
  
  // Check tokenURI
  const tokenId = 1n;
  const uri = await nft.tokenURI(tokenId);
  console.log('Token URI:', uri);
  
  const agent = await nft.getAgentByOwner(deployer.address);
  console.log('\nAgent Details:');
  console.log('  Name:', agent.name);
  console.log('  Total Agents:', (await nft.totalAgents()).toString());
  
  console.log('\n=== COMPLETE ===');
  console.log('AgentNFT:', nftAddr);
  console.log('TX:', mintTx.hash);
  console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + mintTx.hash);
}

main().catch(console.error);
