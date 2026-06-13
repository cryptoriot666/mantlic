const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);
  
  // Deploy MantlicSwap (with receive())
  const MantlicSwap = await ethers.getContractFactory('MantlicSwap');
  const swap = await MantlicSwap.deploy(deployer.address, 30);
  await swap.waitForDeployment();
  const swapAddr = await swap.getAddress();
  console.log('MantlicSwap deployed to:', swapAddr);
  
  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log('MockUSDC deployed to:', usdcAddr);
  
  // Mint USDC to swap contract
  await usdc.mint(swapAddr, ethers.parseEther('1000'));
  console.log('Minted 1000 USDC to MantlicSwap');
  
  // Fund swap with 1 MNT (for paying out native MNT swaps)
  const fundTx = await deployer.sendTransaction({ to: swapAddr, value: ethers.parseEther('1') });
  await fundTx.wait();
  console.log('Funded 1 MNT to MantlicSwap');
  
  // Set prices
  const MNT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  await swap.updatePrice(MNT, ethers.parseEther('0.95'));
  console.log('MNT price: $0.95');
  await swap.updatePrice(usdcAddr, ethers.parseEther('1'));
  console.log('USDC price: $1.00');
  
  // Get quote
  const [expected, minOut] = await swap.getQuote(MNT, usdcAddr, ethers.parseEther('0.1'), 500);
  console.log('\nQuote: 0.1 MNT →', ethers.formatEther(expected), 'USDC (min:', ethers.formatEther(minOut), ')');
  
  // Execute swap
  console.log('\n═══════════════════════════════════════');
  console.log('   EXECUTING REAL ON-CHAIN SWAP');
  console.log('═══════════════════════════════════════');
  const swapTx = await swap.executeSwap(MNT, usdcAddr, ethers.parseEther('0.1'), 0, '0x', { value: ethers.parseEther('0.1') });
  const receipt = await swapTx.wait();
  console.log('TX Hash:', swapTx.hash);
  console.log('Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Logs:', receipt.logs.length);
  
  // Check balances
  const usdcBalance = await usdc.balanceOf(deployer.address);
  console.log('\nUSDC received:', ethers.formatEther(usdcBalance));
  
  console.log('\n=== RESULTS ===');
  console.log('MantlicSwap:', swapAddr);
  console.log('MockUSDC:', usdcAddr);
  console.log('TX Hash:', swapTx.hash);
  console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + swapTx.hash);
}

main().catch(console.error);
