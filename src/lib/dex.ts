// Mantle DEX Integration - Merchant Moe Router
import { parseEther, parseUnits, encodeFunctionData } from 'viem'
import { mantleSepolia, mantle } from './wagmi'

// Merchant Moe Router addresses
export const ROUTER_ADDRESSES = {
  [mantleSepolia.id]: '0x5Eb0F2Fdc83b8F3E1F9b1e2D5E7C4F8B3A9D0E1F', // Sepolia test (mock)
  [mantle.id]: '0x7a250d5630B4cF539739dF2C5dAcb04f6AB7f705', // Mainnet
} as const

// Common tokens on Mantle
export const TOKENS: Record<string, { address: `0x${string}`; decimals: number; symbol: string }> = {
  WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18, symbol: 'WETH' },
  USDC: { address: '0x78a8d6Dd1F32b84f3dC5b99D31b85eB4bB52eD79', decimals: 6, symbol: 'USDC' },
  USDT: { address: '0xf8458367F1aEEB2d5A4F2b2D94b7c1e4C2F1D8E9', decimals: 6, symbol: 'USDT' },
  MNT: { address: '0xdead0000000000000000420694200000000000000', decimals: 18, symbol: 'MNT' },
  WBTC: { address: '0x68f5d9C0dE2a36Fe9bE2B04F3b2B89c0d9B3E8F1', decimals: 8, symbol: 'WBTC' },
}

// ABI fragments for Uniswap-style router
const ROUTER_ABI = [
  {
    name: 'getAmountsOut',
    type: 'function',
    inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }],
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view'
  },
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'swapExactMNTForTokens',
    type: 'function',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'payable'
  }
] as const

export interface SwapQuote {
  amountIn: bigint
  amountOut: bigint
  path: `0x${string}`[]
  expectedOutput: string
  priceImpact: number
  route: string
}

export interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage: number // in basis points (100 = 1%)
  recipient: `0x${string}`
}

export async function getSwapQuote(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  amountIn: string,
  chainId: number = mantleSepolia.id
): Promise<SwapQuote | null> {
  const tokenIn = TOKENS[tokenInSymbol.toUpperCase()]
  const tokenOut = TOKENS[tokenOutSymbol.toUpperCase()]
  
  if (!tokenIn || !tokenOut) {
    return null
  }
  
  const amountInWei = parseUnits(amountIn as `${number}`, tokenIn.decimals)
  const path = [tokenIn.address, tokenOut.address]
  
  // Mock quote for demo (in real impl, call getAmountsOut on router)
  const mockRate = tokenInSymbol === 'MNT' && tokenOutSymbol === 'USDC' 
    ? 0.95 // MNT price mock
    : 1.0
  
  const amountOut = amountInWei * BigInt(Math.floor(mockRate * 1e6)) / BigInt(1e6)
  
  return {
    amountIn: amountInWei,
    amountOut,
    path,
    expectedOutput: parseUnits(String(Number(amountIn) * mockRate), tokenOut.decimals).toString(),
    priceImpact: 0.1, // 0.1%
    route: `${tokenInSymbol} → ${tokenOutSymbol} via Merchant Moe`
  }
}

export async function executeSwap(
  params: SwapParams,
  publicClient: any,
  walletClient: any
): Promise<{ txHash: string; status: 'pending' | 'success' | 'error' }> {
  const tokenIn = TOKENS[params.tokenIn.toUpperCase()]
  const tokenOut = TOKENS[params.tokenOut.toUpperCase()]
  
  if (!tokenIn || !tokenOut) {
    return { txHash: '', status: 'error' }
  }
  
  const amountIn = parseUnits(params.amountIn as `${number}`, tokenIn.decimals)
  const amountOutMin = (amountIn * BigInt(10000 - params.slippage)) / BigInt(10000)
  const path = [tokenIn.address, tokenOut.address]
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 min
  
  try {
    const hash = await walletClient.writeContract({
      address: ROUTER_ADDRESSES[mantleSepolia.id],
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, path, params.recipient, deadline],
      account: walletClient.account,
    })
    
    return { txHash: hash, status: 'pending' }
  } catch (error) {
    console.error('Swap error:', error)
    return { txHash: '', status: 'error' }
  }
}

// Price feed mock (in real impl, use Chainlink or other oracle)
export async function getTokenPrice(tokenSymbol: string): Promise<number> {
  const prices: Record<string, number> = {
    MNT: 0.95,
    WETH: 3500,
    USDC: 1.0,
    USDT: 1.0,
    WBTC: 65000,
  }
  return prices[tokenSymbol.toUpperCase()] || 1.0
}

// Check if condition is met for conditional swap
export async function checkCondition(
  condition: { type: 'price_above' | 'price_below'; token: string; price: number }
): Promise<boolean> {
  const currentPrice = await getTokenPrice(condition.token)
  
  if (condition.type === 'price_above') {
    return currentPrice > condition.price
  } else {
    return currentPrice < condition.price
  }
}
