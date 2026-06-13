/**
 * Deploy MockUSDC + Fund MantlicSwap + Execute Real Swap
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, getAddress } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { ethers } = require('ethers');
const fs = require('fs');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';
const SWAP_ADDR = getAddress('0x4Ef801304e75D22853b1677fA18105B77C1A5423');
const MNT_NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const client = createWalletClient({
  account: ACCOUNT,
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

const publicClient = createPublicClient({
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

async function main() {
  const address = ACCOUNT.address;
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c', provider);
  
  console.log('Wallet:', address);
  const balanceBefore = await publicClient.getBalance({ address });
  console.log('MNT Balance:', formatEther(balanceBefore), 'MNT');
  
  // Deploy MockUSDC
  console.log('\n--- Deploying MockUSDC ---');
  const usdcArtifact = JSON.parse(fs.readFileSync('artifacts/contracts/MockUSDC.sol/MockUSDC.json', 'utf8'));
  const usdcFactory = new ethers.ContractFactory(usdcArtifact.abi, usdcArtifact.bytecode, wallet);
  const usdcContract = await usdcFactory.deploy({ gasLimit: 1500000 });
  await usdcContract.waitForDeployment();
  const usdcAddr = await usdcContract.getAddress();
  console.log('MockUSDC deployed to:', usdcAddr);
  
  // Mint USDC to swap contract (so it can pay out)
  console.log('\n--- Minting 1000 USDC to Swap Contract ---');
  const mintTx = await usdcContract.mint(SWAP_ADDR, parseEther('1000'));
  await mintTx.wait();
  console.log('Minted 1000 USDC to MantlicSwap');
  
  // Fund swap contract with 1 MNT (so it can return native token)
  console.log('\n--- Funding Swap Contract with 1 MNT ---');
  const fundTx = await wallet.sendTransaction({ to: SWAP_ADDR, value: parseEther('1') });
  await fundTx.wait();
  console.log('Funded 1 MNT to MantlicSwap');
  
  // Set prices in swap contract
  console.log('\n--- Setting Price Feeds ---');
  const mntPrice = BigInt(Math.floor(0.95 * 1e18));
  const usdcPrice = BigInt(1e18);
  
  const tx1 = await client.writeContract({
    address: SWAP_ADDR,
    abi: [{ name: 'updatePrice', type: 'function', inputs: [{ name: 'token', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
    functionName: 'updatePrice',
    args: [MNT_NATIVE, mntPrice],
  });
  await publicClient.waitForTransactionReceipt({ hash: tx1 });
  console.log('MNT price: $0.95');
  
  const tx2 = await client.writeContract({
    address: SWAP_ADDR,
    abi: [{ name: 'updatePrice', type: 'function', inputs: [{ name: 'token', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
    functionName: 'updatePrice',
    args: [usdcAddr, usdcPrice],
  });
  await publicClient.waitForTransactionReceipt({ hash: tx2 });
  console.log('USDC price: $1.00');
  
  // Get quote
  console.log('\n--- Quote ---');
  const [expectedOut, minOut] = await publicClient.readContract({
    address: SWAP_ADDR,
    abi: [{ name: 'getQuote', type: 'function', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'slippageBps', type: 'uint256' }], outputs: [{ type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'getQuote',
    args: [MNT_NATIVE, usdcAddr, parseEther('0.1'), 500n],
  });
  console.log('Quote: 0.1 MNT →', formatEther(expectedOut), 'USDC');
  console.log('Min (0.5% slippage):', formatEther(minOut));
  
  // Execute REAL swap
  console.log('\n═══════════════════════════════════════');
  console.log('   EXECUTING REAL ON-CHAIN SWAP');
  console.log('═══════════════════════════════════════');
  console.log('From: MNT (native)');
  console.log('To: USDC (MockUSDC)');
  console.log('Amount: 0.1 MNT');
  console.log('Rate: $0.95/MNT');
  console.log('Expected output: ~0.095 USDC');
  console.log('Fee: 0.3%');
  console.log('Contract: MantlicSwap');
  console.log('═══════════════════════════════════════');
  
  const swapTx = await client.writeContract({
    address: SWAP_ADDR,
    abi: [{
      name: 'executeSwap',
      type: 'function',
      inputs: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'minAmountOut', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ],
      outputs: [{ type: 'uint256' }],
      stateMutability: 'payable',
    }],
    functionName: 'executeSwap',
    value: parseEther('0.1'),
    args: [MNT_NATIVE, usdcAddr, parseEther('0.1'), 0n, '0x'],
  });
  
  console.log('\n✅ TX HASH:', swapTx);
  console.log('🔗 https://sepolia.mantlescan.xyz/tx/' + swapTx);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: swapTx });
  console.log('\n--- TX Receipt ---');
  console.log('Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Block:', receipt.blockNumber?.toString());
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Logs:', receipt.logs.length);
  
  // Check balances
  const usdcBalance = await publicClient.readContract({
    address: usdcAddr,
    abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'balanceOf',
    args: [address],
  });
  
  const balanceAfter = await publicClient.getBalance({ address });
  
  console.log('\n=== FINAL STATE ===');
  console.log('USDC received:', formatEther(usdcBalance));
  console.log('MNT spent:', formatEther(balanceBefore - balanceAfter));
  console.log('\n=== PROOF ===');
  console.log('1. MantlicSwap: 0x4Ef801304e75D22853b1677fA18105B77C1A5423');
  console.log('2. MockUSDC:   ', usdcAddr);
  console.log('3. TX Hash:    ', swapTx);
  console.log('4. Explorer:    https://sepolia.mantlescan.xyz/tx/' + swapTx);
}

main().catch(console.error);
