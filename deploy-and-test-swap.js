/**
 * Deploy MantlicSwap to Mantle Sepolia + Test Swap
 */
const { createWalletClient, createPublicClient, http, parseEther, formatEther, getAddress, erc20Abi } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ACCOUNT = privateKeyToAccount('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c');
const RPC = 'https://rpc.sepolia.mantle.xyz';

const client = createWalletClient({
  account: ACCOUNT,
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

const publicClient = createPublicClient({
  chain: { id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC),
});

// MantlicSwap ABI (key functions)
const SWAP_ABI = [
  {
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
  },
  {
    name: 'getAmountOut',
    type: 'function',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'updatePrice',
    type: 'function',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'feeRecipient',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'feeBps',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
];

// Encode constructor args: (address _feeRecipient, uint256 _feeBps)
const CONSTRUCTOR_ABI = [
  { name: 'feeRecipient', type: 'address' },
  { name: 'feeBps', type: 'uint256' },
];

async function main() {
  const address = ACCOUNT.address;
  console.log('Wallet:', address);
  
  const balance = await publicClient.getBalance({ address });
  console.log('Balance:', formatEther(balance), 'MNT');
  
  // Step 1: Deploy MantlicSwap
  console.log('\n--- Deploying MantlicSwap ---');
  
  // Encode constructor: feeRecipient=address, feeBps=30 (0.3%)
  const constructorData = '0x' + 
    '000000000000000000000000' + address.slice(2) +  // feeRecipient
    '000000000000000000000000000000000000000000000000000000000000001e'; // feeBps=30
  
  // Get bytecode from compilation
  const fs = require('fs');
  let bytecode;
  try {
    const artifact = JSON.parse(fs.readFileSync('cache/solidity-files/cache.json', 'utf8'));
    const key = Object.keys(artifact).find(k => k.includes('MantlicSwap'));
    if (key) {
      bytecode = artifact[key].metadata.settings.compiler.version;
    }
  } catch(e) {}
  
  // Use the compiled artifact if available
  let swapBytecode;
  try {
    const artifactPath = 'artifacts/contracts/MantlicSwap.sol/MantlicSwap.json';
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    swapBytecode = artifact.bytecode;
    console.log('Found compiled bytecode, length:', swapBytecode.length);
  } catch(e) {
    console.log('No compiled artifact, using deploy-swap script...');
  }
  
  // Deploy via Hardhat script approach - create raw tx
  // Since we don't have hardhat running, use ethers.js directly
  const { ethers } = require('ethers');
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet('0x' + 'f3d46112ed541f6dc846d2f8715dbda6cb9e47981496524e9eb4b6c18ac3500c', provider);
  
  // Read the compiled artifact
  let abi, bytecode2;
  try {
    const artifact = JSON.parse(fs.readFileSync('artifacts/contracts/MantlicSwap.sol/MantlicSwap.json', 'utf8'));
    abi = artifact.abi;
    bytecode2 = artifact.bytecode;
  } catch(e) {
    console.log('No artifacts found, will use raw deployment');
  }
  
  if (bytecode2) {
    console.log('Deploying MantlicSwap...');
    const factory = new ethers.ContractFactory(abi, bytecode2, wallet);
    const contract = await factory.deploy(address, 30, { gasLimit: 3000000 });
    console.log('TX:', contract.deploymentTransaction().hash);
    await contract.waitForDeployment();
    const swapAddr = await contract.getAddress();
    console.log('MantlicSwap deployed to:', swapAddr);
    
    // Set price for MNT (address(0)) = 0.95 USDC = 0.95e18
    console.log('\n--- Setting Price Feed ---');
    const mntPrice = BigInt(Math.floor(0.95 * 1e18));
    const usdcPrice = BigInt(1e18);
    const tx1 = await contract.updatePrice('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', mntPrice);
    await tx1.wait();
    console.log('MNT price set:', mntPrice.toString());
    const tx2 = await contract.updatePrice(wallet.address, usdcPrice); // set USDC price to self for simplicity
    await tx2.wait();
    console.log('USDC price set:', usdcPrice.toString());
    
    // Get quote
    console.log('\n--- Getting Quote ---');
    const quote = await contract.getAmountOut(
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      wallet.address, // use wallet address as proxy for USDC
      parseEther('0.1')
    );
    console.log('Quote for 0.1 MNT:', formatEther(quote), 'USDC');
    
    // Execute swap
    console.log('\n--- Executing Swap ---');
    const swapTx = await contract.executeSwap(
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      wallet.address, // use wallet address as proxy for USDC
      parseEther('0.1'),
      0,
      '0x',
      { value: parseEther('0.1'), gasLimit: 500000 }
    );
    console.log('Swap TX:', swapTx.hash);
    const receipt = await swapTx.wait();
    console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
    
    // Check final balance
    const finalBalance = await publicClient.getBalance({ address });
    console.log('\nFinal MNT Balance:', formatEther(finalBalance), 'MNT');
    console.log('Explorer: https://sepolia.mantlescan.xyz/tx/' + swapTx.hash);
  } else {
    console.log('ERROR: No compiled bytecode found. Run: cd mantlic && npx hardhat compile');
  }
}

main().catch(console.error);
