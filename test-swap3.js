/**
 * Mantle Sepolia Swap Test v3
 * Focus: Test MantlicSwap contract directly with MNT
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, getAddress } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';
const MANTLIC_SWAP = getAddress('0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78');

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
  
  // 1. Check native MNT balance
  const balance = await publicClient.getBalance({ address });
  console.log('MNT Balance:', formatEther(balance), 'MNT');
  
  // 2. Check if MantlicSwap is a contract
  const code = await publicClient.getCode({ address: MANTLIC_SWAP });
  console.log('MantlicSwap code size:', code.length, 'chars');
  
  // 3. Try simple functions
  console.log('\n--- Reading MantlicSwap ---');
  
  // name() - 0x06fdde03
  try {
    const name = await publicClient.readContract({
      address: MANTLIC_SWAP,
      abi: [{ name: 'name', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' }],
      functionName: 'name',
    });
    console.log('Contract name:', name);
  } catch(e) {
    console.log('name(): reverted');
  }
  
  // Try swapExactMNTForTokens
  try {
    const hash = await client.writeContract({
      address: MANTLIC_SWAP,
      abi: [{
        name: 'swapExactMNTForTokens',
        type: 'function',
        inputs: [
          { name: 'minOut', type: 'uint256' },
          { name: 'path', type: 'address[]' },
        ],
        outputs: [],
        stateMutability: 'payable',
      }],
      functionName: 'swapExactMNTForTokens',
      value: parseEther('0.05'),
      args: [0n, []],
    });
    console.log('\nswapExactMNTForTokens TX:', hash);
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Status:', receipt.status === 'success' ? 'SUCCESS' : 'FAILED');
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
  } catch(e) {
    console.log('swapExactMNTForTokens error:', e.shortMessage || e.message.slice(0, 200));
  }
  
  // 4. Check events from MantlicSwap
  console.log('\n--- Recent events from MantlicSwap ---');
  try {
    const logs = await publicClient.getLogs({
      address: MANTLIC_SWAP,
      fromBlock: BigInt(39000000),
      toBlock: 'latest',
      events: [{ type: 'Swap', inputs: [] }],
    });
    console.log('Swap events:', logs.length);
    logs.slice(-3).forEach(log => {
      console.log('  Block:', log.blockNumber?.toString(), 'TX:', log.transactionHash?.slice(0, 20));
    });
  } catch(e) {
    console.log('getLogs error:', e.message.slice(0, 100));
  }
  
  // 5. Final balance check
  const finalBalance = await publicClient.getBalance({ address });
  console.log('\n--- Final ---');
  console.log('Final MNT Balance:', formatEther(finalBalance), 'MNT');
  console.log('Spent:', formatEther(balance - finalBalance), 'MNT');
}

main().catch(console.error);
