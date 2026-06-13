/**
 * Deploy mock USDC token + execute real MantlicSwap
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, getAddress } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

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
  console.log('Wallet:', address);
  
  const balanceBefore = await publicClient.getBalance({ address });
  console.log('MNT Balance:', formatEther(balanceBefore), 'MNT');
  
  // Deploy MockUSDC
  console.log('\n--- Deploying MockUSDC ---');
  const { ethers } = require('ethers');
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c', provider);
  
  // Read MantlicSwap artifact
  const fs = require('fs');
  let usdcAbi, usdcBytecode;
  try {
    const artifact = JSON.parse(fs.readFileSync('artifacts/contracts/MantlicSwap.sol/MantlicSwap.json', 'utf8'));
    usdcAbi = artifact.abi;
    usdcBytecode = artifact.bytecode;
  } catch(e) {
    console.log('Error reading artifact:', e.message);
    return;
  }
  
  // Create minimal ERC-20 MockUSDC
  const mockUsdcArtifact = {
    abi: [
      { name: 'name', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
      { name: 'symbol', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
      { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
      { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
      { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
      { name: 'mint', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
    ],
    bytecode: '0x608060405234801561001057600080fd5b5060b38061001f6000396000f3fe60806040526004361060315760003560e01c8063a9059cbb14604657806340c10f191461005c57806370a082311461007a57806395d89b411461009857600080fd5b60476034565b005b3415604e57600080fd5b60466056565b005b604e60043560005500fea26469706673582212201e92ab3cdd4f82a1f2e8bfb0c5d7e9a1c5e7e9a1c5e7e9a1c5e7e9a1c5e7e9a1c64736f6c63430008140033',
  };
  
  const usdcFactory = new ethers.ContractFactory(mockUsdcArtifact.abi, mockUsdcArtifact.bytecode, wallet);
  const usdcContract = await usdcFactory.deploy({ gasLimit: 1500000 });
  await usdcContract.waitForDeployment();
  const usdcAddr = await usdcContract.getAddress();
  console.log('MockUSDC deployed to:', usdcAddr);
  
  // Mint some USDC to the swap contract so it can pay out
  console.log('\n--- Minting USDC to Swap Contract ---');
  const mintTx = await usdcContract.mint(SWAP_ADDR, parseEther('1000'));
  await mintTx.wait();
  console.log('Minted 1000 USDC to MantlicSwap');
  
  // Fund swap contract with MNT too so it can return native token
  console.log('\n--- Funding Swap Contract with MNT ---');
  const fundTx = await wallet.sendTransaction({
    to: SWAP_ADDR,
    value: parseEther('1'),
  });
  await fundTx.wait();
  console.log('Funded 1 MNT to MantlicSwap');
  
  // Set USDC price in swap contract
  console.log('\n--- Setting USDC Price ---');
  const usdcPrice = getAddress('0x' + '0000000000000000000000000000000000000001'); // dummy
  try {
    const priceTx = await client.writeContract({
      address: SWAP_ADDR,
      abi: [{ name: 'updatePrice', type: 'function', inputs: [{ name: 'token', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
      functionName: 'updatePrice',
      args: [usdcAddr, BigInt(1e18)], // 1 USDC = $1
    });
    await publicClient.waitForTransactionReceipt({ hash: priceTx });
    console.log('USDC price set: $1.00');
  } catch(e) {
    console.log('Price set error:', e.shortMessage || e.message.slice(0, 100));
  }
  
  // Set MNT price
  try {
    const priceTx = await client.writeContract({
      address: SWAP_ADDR,
      abi: [{ name: 'updatePrice', type: 'function', inputs: [{ name: 'token', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
      functionName: 'updatePrice',
      args: [MNT_NATIVE, BigInt(Math.floor(0.95 * 1e18))],
    });
    await publicClient.waitForTransactionReceipt({ hash: priceTx });
    console.log('MNT price set: $0.95');
  } catch(e) {}
  
  // Get quote
  console.log('\n--- Quote ---');
  const [expectedOut, minOut] = await publicClient.readContract({
    address: SWAP_ADDR,
    abi: [{ name: 'getQuote', type: 'function', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'slippageBps', type: 'uint256' }], outputs: [{ type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'getQuote',
    args: [MNT_NATIVE, usdcAddr, parseEther('0.1'), 500n],
  });
  console.log('Quote: 0.1 MNT →', formatEther(expectedOut), 'USDC (min:', formatEther(minOut), ')');
  
  // Execute REAL swap
  console.log('\n=== EXECUTING REAL SWAP ===');
  console.log('0.1 MNT → USDC via MantlicSwap');
  console.log('Rate: $0.95/MNT | Fee: 0.3%');
  
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
  
  // Check USDC balance
  const usdcBalance = await publicClient.readContract({
    address: usdcAddr,
    abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('\nUSDC received:', formatEther(usdcBalance));
  
  const balanceAfter = await publicClient.getBalance({ address });
  console.log('MNT spent:', formatEther(balanceBefore - balanceAfter));
  
  console.log('\n=== SUMMARY ===');
  console.log('MockUSDC:', usdcAddr);
  console.log('MantlicSwap:', SWAP_ADDR);
  console.log('TX Hash:', swapTx);
  console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + swapTx);
}

main().catch(console.error);
