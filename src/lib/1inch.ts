// Real1inch Fusion API Integration for Mantle
//1inch supports Mantle chain (chainId: 5000)

export const MANTLE_CHAIN_ID = 5000
export const MANTLE_RPC = 'https://rpc.mantle.xyz'

// 1inch Fusion API endpoints
const BASE_URL = 'https://api.1inch.dev/fusion/v1.0'

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromTokenAmount: string
  toTokenAmount: string
  route: any
  estimatedGas: number
}

export interface SwapParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  fromAddress: string
  slippage: number // in basis points
}

// Native MNT wrapper
const MNT_ADDRESS = '0xdead0000000000000000420694200000000000000'

// Common tokens on Mantle
export const MANTLE_TOKENS: Record<string, Token> = {
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
  },
  USDC: {
    address: '0x78a8d6Dd1F32b84f3dC5b99D31b85eB4bB52eD79',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
  },
  USDT: {
    address: '0xf8458367F1aEEB2d5A4F2b2D94b7c1e4C2F1D8E9',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
  },
  WBTC: {
    address: '0x68f5d9C0dE2a36Fe9bE2B04F3b2B89c0d9B3E8F1',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    logoURI: 'https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfed661d6c9d8d6a1.png'
  },
  MNT: {
    address: MNT_ADDRESS,
    symbol: 'MNT',
    name: 'Mantle',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/30980/small/social.png'
  }
}

// Get API key from env or use demo
function getApiKey(): string {
  return process.env.NEXT_PUBLIC_1INCH_API_KEY || 'demo'
}

// Get swap quote from1inch Fusion
export async function getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
  const apiKey = getApiKey()
  
  try {
    const url = `${BASE_URL}/quote`
    const queryParams = new URLSearchParams({
      chainId: MANTLE_CHAIN_ID.toString(),
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      includeGas: 'true'
    })
    
    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('1inch API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    return {
      fromToken: data.fromToken,
      toToken: data.toToken,
      fromTokenAmount: data.fromTokenAmount || params.amount,
      toTokenAmount: data.toTokenAmount,
      route: data.route,
      estimatedGas: data.estimatedGas || 200000
    }
  } catch (error) {
    console.error('Swap quote error:', error)
    return null
  }
}

// Get swap transaction data
export async function getSwapTransaction(params: SwapParams): Promise<{
  to: string
  data: string
  value: string
} | null> {
  const apiKey = getApiKey()
  
  try {
    const url = `${BASE_URL}/swap`
    const queryParams = new URLSearchParams({
      chainId: MANTLE_CHAIN_ID.toString(),
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      from: params.fromAddress,
      slippage: (params.slippage / 100).toString(), // Convert bps to percentage
      includeGas: 'true'
    })
    
    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('1inch swap API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    return {
      to: data.tx.to,
      data: data.tx.data,
      value: data.tx.value || '0'
    }
  } catch (error) {
    console.error('Swap transaction error:', error)
    return null
  }
}

// Get token list
export async function getTokenList(): Promise<Token[]> {
  const apiKey = getApiKey()
  
  try {
    const response = await fetch(`${BASE_URL}/tokens/${MANTLE_CHAIN_ID}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('1inch tokens API error:', response.status)
      return Object.values(MANTLE_TOKENS)
    }
    
    const data = await response.json()
    return data.tokens ? Object.values(data.tokens) : Object.values(MANTLE_TOKENS)
  } catch (error) {
    console.error('Token list error:', error)
    return Object.values(MANTLE_TOKENS)
  }
}

// Get native token price (mock for demo)
export async function getMNTPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=mantle&vs_currencies=usd')
    if (response.ok) {
      const data = await response.json()
      return data.mantle?.usd || 0.95
    }
  } catch (error) {
    console.error('Price fetch error:', error)
  }
  return 0.95 // Fallback price
}

// Token balance helper
export function formatTokenAmount(amount: string, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const value = BigInt(amount)
  const wholePart = value / divisor
  const fractionalPart = value % divisor
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmedFractional = fractionalStr.slice(0, 4)
  
  return `${wholePart}.${trimmedFractional}`
}
