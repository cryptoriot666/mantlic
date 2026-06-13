const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = MockUSDC.attach('0xb60068d080B422e8A83d6ae8b7983f7B2f93A909');
  
  // Test MockUSDC directly
  console.log('Testing MockUSDC...');
  const name = await usdc.name();
  const symbol = await usdc.symbol();
  console.log('Name:', name, 'Symbol:', symbol);
  
  const bal = await usdc.balanceOf(deployer.address);
  console.log('Deployer USDC:', ethers.formatEther(bal));
  
  // Mint more to deployer
  const mintTx = await usdc.mint(deployer.address, ethers.parseEther('5'));
  await mintTx.wait();
  console.log('Minted 5 USDC to deployer');
  
  const bal2 = await usdc.balanceOf(deployer.address);
  console.log('Deployer USDC after mint:', ethers.formatEther(bal2));
  
  // Transfer to another address
  const testAddr = '0xd143d9b5B40BB2D0860EF41F70F378a78Fc1fCBd';
  const tx = await usdc.transfer(testAddr, ethers.parseEther('1'));
  await tx.wait();
  console.log('Transferred 1 USDC to', testAddr);
  
  const bal3 = await usdc.balanceOf(deployer.address);
  console.log('Deployer USDC after transfer:', ethers.formatEther(bal3));
  
  console.log('\nMockUSDC is working correctly!');
}

main().catch(console.error);
