/**
 * Test MantlicSwap already deployed at 0x4Ef801304e75D22853b1677fA18105B77C1A5423
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, getAddress } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';
const SWAP_ADDR = getAddress('0x4Ef801304e75D22853b1677fA18105B77C1A5423');

const client = createWalletClient({
  account: ACCOUNT,
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

const publicClient = createPublicClient({
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

const MNT_NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

async function main() {
  const address = ACCOUNT.address;
  console.log('Wallet:', address);
  console.log('MantlicSwap:', SWAP_ADDR);
  
  const balance = await publicClient.getBalance({ address });
  console.log('Balance:', formatEther(balance), 'MNT');
  
  // Read contract state
  console.log('\n--- Reading Contract ---');
  const owner = await publicClient.readContract({
    address: SWAP_ADDR,
    abi: [{ name: 'owner', type: 'function', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' }],
    functionName: 'owner',
  });
  console.log('Owner:', owner);
  
  const feeBps = await publicClient.readContract({
    address: SWAP_ADDR,
    abi: [{ name: 'feeBps', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'feeBps',
  });
  console.log('Fee:', Number(feeBps) / 100, '%');
  
  // Set MNT price (owner only)
  console.log('\n--- Setting Price ---');
  const mntPrice = BigInt(Math.floor(0.95 * 1e18));
  try {
    const tx = await client.writeContract({
      address: SWAP_ADDR,
      abi: [{ name: 'updatePrice', type: 'function', inputs: [{ name: 'token', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
      functionName: 'updatePrice',
      args: [MNT_NATIVE, mntPrice],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log('MNT price set:', mntPrice.toString(), 'Status:', receipt.status === 'success' ? 'OK' : 'FAIL');
  } catch(e) {
    console.log('updatePrice error:', e.shortMessage || e.message.slice(0, 150));
  }
  
  // Get quote
  console.log('\n--- Quote ---');
  const quote = await publicClient.readContract({
    address: SWAP_ADDR,
    abi: [
      { name: 'getAmountOut', type: 'function', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
      { name: 'getQuote', type: 'function', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'slippageBps', type: 'uint256' }], outputs: [{ type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view' },
    ],
    functionName: 'getQuote',
    args: [MNT_NATIVE, address, parseEther('0.1'), 500n],
  });
  console.log('Quote for 0.1 MNT → USDC:', formatEther(quote[0]), 'expected,', formatEther(quote[1]), 'min (5% slippage)');
  
  // Execute swap
  console.log('\n--- Executing Swap ---');
  try {
    const tx = await client.writeContract({
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
      args: [MNT_NATIVE, address, parseEther('0.1'), 0n, '0x'],
    });
    console.log('Swap TX:', tx);
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + tx);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log('Status:', receipt.status === 'success' ? 'SUCCESS ✅' : 'FAILED ❌');
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
    
    // Parse logs for SwapExecuted event
    if (receipt.logs.length > 0) {
      console.log('\n--- Event Data ---');
      receipt.logs.forEach((log, i) => {
        if (log.address === SWAP_ADDR) {
          console.log(`Log ${i}: topics=${log.topics.map(t => t.slice(0, 10))}`);
        }
      });
    }
  } catch(e) {
    console.log('Swap error:', e.shortMessage || e.message.slice(0, 300));
  }
  
  // Final balance
  const finalBalance = await publicClient.getBalance({ address });
  console.log('\n--- Final ---');
  console.log('Final MNT Balance:', formatEther(finalBalance), 'MNT');
  console.log('Spent:', formatEther(balance - finalBalance), 'MNT');
}

main().catch(console.error);
