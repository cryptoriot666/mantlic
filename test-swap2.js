/**
 * Direct MantlicSwap test
 * Use MantlicSwap as simple DEX - deposit MNT, get USDC back
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, erc20Abi, getAddress } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';
const MANTLIC_SWAP = getAddress('0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78');
const USDC = getAddress('0x78a8d6Dd1F32b84f3dC5b99D31b85eB4bB52eD79');

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
  
  // 1. Check USDC balance
  const usdcBalance = await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('USDC balance:', usdcBalance.toString());
  
  // 2. Try MantlicSwap functions
  console.log('\n--- Reading MantlicSwap ---');
  
  // Try fee()
  try {
    const fee = await publicClient.readContract({
      address: MANTLIC_SWAP,
      abi: [{ name: 'fee', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
      functionName: 'fee',
    });
    console.log('Fee:', fee.toString());
  } catch(e) {}
  
  // Try getReserve()
  try {
    const reserve = await publicClient.readContract({
      address: MANTLIC_SWAP,
      abi: [{ name: 'getReserve', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
      functionName: 'getReserve',
    });
    console.log('Reserve:', reserve.toString());
  } catch(e) {}
  
  // Try getAmountOut (if it exists)
  try {
    const amountOut = await publicClient.readContract({
      address: MANTLIC_SWAP,
      abi: [{ name: 'getAmountOut', type: 'function', inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'tokenIn', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
      functionName: 'getAmountOut',
      args: [parseEther('1'), '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'],
    });
    console.log('getAmountOut(1 MNT):', formatEther(amountOut));
  } catch(e) {
    console.log('getAmountOut: not available');
  }
  
  // 3. Try a simple swap via MantlicSwap
  console.log('\n--- Attempting Swap via MantlicSwap ---');
  const amountIn = parseEther('0.05'); // 0.05 MNT
  
  // Try swapMNTForTokens if exists
  try {
    const hash = await client.writeContract({
      address: MANTLIC_SWAP,
      abi: [{
        name: 'swapMNTForTokens',
        type: 'function',
        inputs: [{ name: 'minOut', type: 'uint256' }],
        outputs: [],
        stateMutability: 'payable',
      }],
      functionName: 'swapMNTForTokens',
      value: amountIn,
      args: [0n],
    });
    console.log('swapMNTForTokens TX:', hash);
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + hash);
    
    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Status:', receipt.status);
    console.log('Gas used:', receipt.gasUsed.toString());
  } catch(e) {
    console.log('swapMNTForTokens error:', e.shortMessage || e.message);
  }
  
  // 4. If that fails, try a simple native transfer to the contract
  console.log('\n--- Direct Transfer to Contract ---');
  try {
    const hash = await client.sendTransaction({
      to: MANTLIC_SWAP,
      value: parseEther('0.01'),
      data: '0x',
    });
    console.log('Transfer TX:', hash);
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Status:', receipt.status);
  } catch(e) {
    console.log('Transfer error:', e.shortMessage || e.message);
  }
}

main().catch(console.error);
