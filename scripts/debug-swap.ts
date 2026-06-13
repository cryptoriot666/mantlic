const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  
  // Deploy MantlicSwap
  const MantlicSwap = await ethers.getContractFactory('MantlicSwap');
  const swap = await MantlicSwap.deploy(deployer.address, 30);
  await swap.waitForDeployment();
  const swapAddr = await swap.getAddress();
  console.log('MantlicSwap:', swapAddr);
  
  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log('MockUSDC:', usdcAddr);
  
  // Verify contracts exist
  const swapCode = await deployer.provider.getCode(swapAddr);
  const usdcCode = await deployer.provider.getCode(usdcAddr);
  console.log('Swap code length:', swapCode.length);
  console.log('USDC code length:', usdcCode.length);
  
  // Test MockUSDC functions
  try {
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    console.log('MockUSDC name:', name, 'symbol:', symbol, 'decimals:', decimals);
  } catch(e) {
    console.log('MockUSDC read error:', e.message);
  }
  
  // Mint USDC to swap contract
  const mintTx = await usdc.mint(swapAddr, ethers.parseEther('1000'));
  await mintTx.wait();
  console.log('Minted 1000 USDC to swap');
  
  // Check swap contract USDC balance
  const swapUsdcBal = await usdc.balanceOf(swapAddr);
  console.log('Swap USDC balance:', ethers.formatEther(swapUsdcBal));
  
  // Fund swap with MNT
  const fundTx = await deployer.sendTransaction({ to: swapAddr, value: ethers.parseEther('1') });
  await fundTx.wait();
  console.log('Funded 1 MNT to swap');
  
  // Check swap MNT balance
  const swapMntBal = await ethers.provider.getBalance(swapAddr);
  console.log('Swap MNT balance:', ethers.formatEther(swapMntBal));
  
  // Set prices
  const MNT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  await swap.updatePrice(MNT, ethers.parseEther('0.95'));
  await swap.updatePrice(usdcAddr, ethers.parseEther('1'));
  console.log('Prices set');
  
  // Get quote
  const [expected, minOut] = await swap.getQuote(MNT, usdcAddr, ethers.parseEther('0.1'), 500);
  console.log('Quote:', ethers.formatEther(expected), 'USDC');
  
  // Execute swap
  console.log('\n=== SWAP ===');
  try {
    const swapTx = await swap.executeSwap(MNT, usdcAddr, ethers.parseEther('0.1'), 0, '0x', { value: ethers.parseEther('0.1') });
    const receipt = await swapTx.wait();
    console.log('TX:', swapTx.hash);
    console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
    console.log('Gas:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
    
    const usdcBal = await usdc.balanceOf(deployer.address);
    console.log('USDC received:', ethers.formatEther(usdcBal));
  } catch(e) {
    console.log('Swap error:', e.message);
    
    // Try direct ERC20 transfer to debug
    console.log('\n--- Debug: Direct USDC transfer ---');
    try {
      const bal = await usdc.balanceOf(swapAddr);
      console.log('Swap USDC balance before direct:', ethers.formatEther(bal));
      const tx = await usdc.transfer(deployer.address, ethers.parseEther('1'));
      await tx.wait();
      console.log('Direct transfer works!');
    } catch(e2) {
      console.log('Direct transfer error:', e2.message);
    }
  }
  
  console.log('\nMantlicSwap:', swapAddr);
  console.log('MockUSDC:', usdcAddr);
}

main().catch(console.error);
