/**
 * Mantle Sepolia Test Swap
 * Wallet: 0xd143d9b5b40bb2d0860ef41f70f378a78fc1fcbd
 * Swap 0.1 MNT → USDC via 1inch Router
 */
const { createWalletClient, createPublicClient, http, encodeFunctionData, parseEther, formatEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';
const ROUTER = '0x1111111254EEB27677F8190F5679C2D5aE2d4f7d'; // 1inch Router v5
const USDC_SEPOLIA = '0x78a8d6Dd1F32b84f3dC5b99D31b85eB4bB52eD79';
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
  
  // Get balance
  const balance = await publicClient.getBalance({ address });
  console.log('Balance:', formatEther(balance), 'MNT');
  
  // Simple swap: send 0.1 MNT to router as native swap
  // 1inch Router accepts native MNT for swap
  const amountIn = parseEther('0.1');
  const amountOutMin = parseEther('0.09'); // 10% slippage
  
  console.log('\n--- Executing Swap ---');
  console.log('Amount in:', formatEther(amountIn), 'MNT');
  console.log('Min out:', formatEther(amountOutMin), 'USDC');
  
  try {
    // Build swap data via 1inch Fusion API
    const quoteResp = await fetch(`https://api.1inch.dev/fusion/v1.0/quote?chainId=5003&src=${MNT_NATIVE}&dst=${USDC_SEPOLIA}&amount=${amountIn.toString()}&includeGas=true`, {
      headers: { 'Authorization': 'Bearer demo' }
    });
    
    if (quoteResp.ok) {
      const quote = await quoteResp.json();
      console.log('1inch Quote:', JSON.stringify(quote).slice(0, 200));
    } else {
      console.log('1inch Quote failed:', quoteResp.status, await quoteResp.text().then(t => t.slice(0, 100)));
    }
  } catch (err) {
    console.log('1inch API error:', err.message);
  }
  
  // Try direct swap via 1inch swap endpoint
  console.log('\n--- Attempting Direct Swap ---');
  try {
    const swapResp = await fetch(`https://api.1inch.dev/fusion/v1.0/swap?chainId=5003&src=${MNT_NATIVE}&dst=${USDC_SEPOLIA}&amount=${amountIn.toString()}&from=${address}&slippage=1&includeGas=true`, {
      headers: { 'Authorization': 'Bearer demo' }
    });
    
    if (swapResp.ok) {
      const swapData = await swapResp.json();
      console.log('Swap data received:', JSON.stringify(swapData).slice(0, 300));
      
      if (swapData.tx) {
        console.log('\nExecuting swap transaction...');
        const hash = await client.sendTransaction({
          to: swapData.tx.to,
          data: swapData.tx.data,
          value: swapData.tx.value || 0n,
        });
        console.log('TX Hash:', hash);
        console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + hash);
      }
    } else {
      console.log('Swap API failed:', swapResp.status, await swapResp.text().then(t => t.slice(0, 200)));
    }
  } catch (err) {
    console.log('Swap error:', err.message);
  }
  
  // Fallback: simple transfer test
  console.log('\n--- Fallback: Self-transfer test ---');
  try {
    const hash = await client.sendTransaction({
      to: address,
      value: parseEther('0.001'),
    });
    console.log('Self-transfer TX:', hash);
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + hash);
  } catch (err) {
    console.log('Transfer error:', err.message);
  }
}

main().catch(console.error);
