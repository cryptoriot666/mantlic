const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const MantlicSwap = await ethers.getContractFactory('MantlicSwap');
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  
  const swap = MantlicSwap.attach('0x482D790926557CB9F130dD91f4B489BF93568Ab4');
  const usdc = MockUSDC.attach('0xb60068d080B422e8A83d6ae8b7983f7B2f93A909');
  
  // Give deployer some USDC so fee transfer works
  const deployerUsdcBal = await usdc.balanceOf(deployer.address);
  console.log('Deployer USDC balance:', ethers.formatEther(deployerUsdcBal));
  
  if (deployerUsdcBal.toString() === '0') {
    // Mint directly to deployer  
    const mintTx = await usdc.mint(deployer.address, ethers.parseEther('10'));
    await mintTx.wait();
    console.log('Minted 10 USDC to deployer');
  }
  
  // Try swap again
  const MNT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  console.log('\n=== SWAP ===');
  try {
    const swapTx = await swap.executeSwap(MNT, usdc.target, ethers.parseEther('0.1'), 0, '0x', { value: ethers.parseEther('0.1') });
    const receipt = await swapTx.wait();
    console.log('TX:', swapTx.hash);
    console.log('Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Gas:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
    
    const usdcBal = await usdc.balanceOf(deployer.address);
    console.log('USDC received:', ethers.formatEther(usdcBal));
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + swapTx.hash);
  } catch(e) {
    console.log('Swap error:', e.message.split('\n')[0]);
  }
}

main().catch(console.error);
