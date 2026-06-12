export type CommandIntent = 
  | { type: 'swap'; amount: string; fromToken: string; toToken: string }
  | { type: 'balance' }
  | { type: 'yield' }
  | { type: 'register'; name: string }
  | { type: 'benchmark'; type_: string; score: number }
  | { type: 'help' }
  | { type: 'unknown'; raw: string }

export interface ParsedCommand {
  type: 'swap' | 'balance' | 'yield' | 'monitor' | 'status' | 'help' | 'register' | 'benchmark' | 'leaderboard' | 'unknown'
  params: any
  raw: string
}

export interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage?: number
  condition?: {
    token: string
    type: 'price_above' | 'price_below'
    price: number
  }
}

export function parseCommand(input: string): ParsedCommand {
  const text = input.trim().toLowerCase()
  
  // Parse swap command
  const swapMatch = text.match(/swap\s+([\d.]+)\s+(\w+)\s+(?:for|to)\s+(\w+)/)
  if (swapMatch) {
    return {
      type: 'swap',
      params: {
        amountIn: swapMatch[1],
        tokenIn: swapMatch[2].toUpperCase(),
        tokenOut: swapMatch[3].toUpperCase(),
        slippage: 50,
      },
      raw: input,
    }
  }
  
  // Parse balance
  if (text === 'balance') {
    return { type: 'balance', params: {}, raw: input }
  }
  
  // Parse yield
  if (text === 'yield') {
    return { type: 'yield', params: {}, raw: input }
  }
  
  // Parse register
  if (text.startsWith('register')) {
    return { type: 'register', params: { name: input.replace(/^register\s*/i, '') || 'Agent' }, raw: input }
  }
  
  // Parse benchmark
  if (text.startsWith('benchmark')) {
    return { type: 'benchmark', params: { type_: 'dex_arbitrage', score: 8500 }, raw: input }
  }
  
  // Parse help
  if (text === 'help') {
    return { type: 'help', params: {}, raw: input }
  }
  
  // Parse status
  if (text === 'status' || text === 'stats') {
    return { type: 'status', params: {}, raw: input }
  }
  
  // Parse leaderboard
  if (text === 'leaderboard' || text === 'top agents' || text === 'rankings') {
    return { type: 'leaderboard', params: {}, raw: input }
  }
  
  // Parse monitor
  const monitorMatch = text.match(/monitor\s+(\w+)\s+(above|below)\s+\$?([\d.]+)/)
  if (monitorMatch) {
    return {
      type: 'monitor',
      params: {
        token: monitorMatch[1].toUpperCase(),
        condition: {
          type: monitorMatch[2] === 'below' ? 'price_below' : 'price_above',
          price: parseFloat(monitorMatch[3]),
        },
        action: { params: { tokenIn: 'MNT', tokenOut: 'USDC', amountIn: '100', slippage: 50 } },
      },
      raw: input,
    }
  }
  
  return { type: 'unknown', params: {}, raw: input }
}

export function getHelpText(): string {
  return `AVAILABLE COMMANDS:
  
  swap <amount> <token> for <token>
    Example: swap 100 MNT for USDC
  
  balance [token|ALL]
    Example: balance USDC
  
  yield
    Compare DeFi yields across Mantle
  
  leaderboard
    Show top agent rankings
  
  monitor <token> <above|below> $<price>
    Example: monitor MNT below $1.50
  
  status
    Show system status and prices
  
  register agent <name>
    Register as an AI agent
  
  help
    Show this help text

NETWORK: Mantle (Chain ID: 5000)
SUPPORTED TOKENS: MNT, USDC, USDT, WETH`
}