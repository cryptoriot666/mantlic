// Natural Language Command Parser
// Parses user input into structured commands

export type CommandType = 
  | 'swap'
  | 'balance'
  | 'yield'
  | 'monitor'
  | 'help'
  | 'status'
  | 'unknown'

export interface ParsedCommand {
  type: CommandType
  raw: string
  params: Record<string, any>
  confidence: number //0-1, how confident we are in parsing
}

export interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountInWei?: bigint
  slippage: number
  condition?: {
    type: 'price_above' | 'price_below'
    token: string
    price: number
  }
}

export interface BalanceParams {
  token?: string
  address?: string
}

export interface MonitorParams {
  token: string
  condition: {
    type: 'price_above' | 'price_below'
    price: number
  }
  action: {
    type: 'swap'
    params: SwapParams
  }
}

// Token aliases for natural language
const TOKEN_ALIASES: Record<string, string> = {
  'eth': 'WETH',
  'bitcoin': 'WBTC',
  'tether': 'USDT',
  'usd coin': 'USDC',
  'native': 'MNT',
  'mantle': 'MNT',
}

// Parse swap command
function parseSwapCommand(input: string): { params: SwapParams; confidence: number } | null {
  const lower = input.toLowerCase()
  
  // Pattern 1: "swap 100 MNT for USDC"
  const pattern1 = /swap\s+([\d.]+)\s*(\w+)\s+(?:for|to|into)\s+(\w+)/i
  const match1 = lower.match(pattern1)
  if (match1) {
    return {
      params: {
        tokenIn: TOKEN_ALIASES[match1[2]] || match1[2].toUpperCase(),
        tokenOut: TOKEN_ALIASES[match1[3]] || match1[3].toUpperCase(),
        amountIn: match1[1],
        slippage: 50, // 0.5% default
      },
      confidence: 0.95
    }
  }
  
  // Pattern 2: "buy 100 USDC with MNT"
  const pattern2 = /buy\s+([\d.]+)\s+(\w+)\s+(?:with|using)\s+(\w+)/i
  const match2 = lower.match(pattern2)
  if (match2) {
    return {
      params: {
        tokenIn: TOKEN_ALIASES[match2[3]] || match2[3].toUpperCase(),
        tokenOut: TOKEN_ALIASES[match2[2]] || match2[2].toUpperCase(),
        amountIn: match2[1],
        slippage: 50,
      },
      confidence: 0.9
    }
  }
  
  // Pattern 3: "sell all MNT for USDC"
  const pattern3 = /sell\s+(?:all\s+)?(\w+)\s+(?:for|to|into)\s+(\w+)/i
  const match3 = lower.match(pattern3)
  if (match3) {
    return {
      params: {
        tokenIn: TOKEN_ALIASES[match3[1]] || match3[1].toUpperCase(),
        tokenOut: TOKEN_ALIASES[match3[2]] || match3[2].toUpperCase(),
        amountIn: 'ALL', // Special case
        slippage: 50,
      },
      confidence: 0.85
    }
  }
  
  // Pattern 4: Conditional "swap MNT for USDC when MNT < 0.90"
  const pattern4 = /swap\s+(\w+)\s+(?:for|to|into)\s+(\w+)\s+when\s+(\w+)\s*([<>])\s*([\d.]+)/i
  const match4 = lower.match(pattern4)
  if (match4) {
    return {
      params: {
        tokenIn: TOKEN_ALIASES[match4[1]] || match4[1].toUpperCase(),
        tokenOut: TOKEN_ALIASES[match4[2]] || match4[2].toUpperCase(),
        amountIn: 'ALL',
        slippage: 50,
        condition: {
          type: match4[4] === '<' ? 'price_below' : 'price_above',
          token: TOKEN_ALIASES[match4[3]] || match4[3].toUpperCase(),
          price: parseFloat(match4[5])
        }
      },
      confidence: 0.8
    }
  }
  
  return null
}

// Parse balance command
function parseBalanceCommand(input: string): { params: BalanceParams; confidence: number } | null {
  const lower = input.toLowerCase()
  
  // "balance" or "my balance"
  if (lower.includes('balance')) {
    const tokenMatch = lower.match(/balance\s+(?:of\s+)?(\w+)/i)
    return {
      params: {
        token: tokenMatch ? (TOKEN_ALIASES[tokenMatch[1]] || tokenMatch[1].toUpperCase()) : 'ALL'
      },
      confidence: 0.95
    }
  }
  
  return null
}

// Parse yield command
function parseYieldCommand(input: string): { params: {}; confidence: number } | null {
  const lower = input.toLowerCase()
  
  if (lower.includes('yield') || lower.includes('apy') || lower.includes('earn')) {
    return {
      params: {},
      confidence: 0.95
    }
  }
  
  return null
}

// Parse monitor/watch command
function parseMonitorCommand(input: string): { params: MonitorParams; confidence: number } | null {
  const lower = input.toLowerCase()
  
  // "watch MNT, sell when > $1.00"
  const pattern = /watch\s+(\w+)[,;]?\s*(?:sell|buy)\s+(?:when\s+)?(\w+)\s*([<>])\s*\$?([\d.]+)/i
  const match = lower.match(pattern)
  if (match) {
    return {
      params: {
        token: TOKEN_ALIASES[match[1]] || match[1].toUpperCase(),
        condition: {
          type: match[3] === '<' ? 'price_below' : 'price_above',
          price: parseFloat(match[4])
        },
        action: {
          type: 'swap',
          params: {
            tokenIn: 'MNT',
            tokenOut: 'USDC',
            amountIn: 'ALL',
            slippage: 50
          }
        }
      },
      confidence: 0.75
    }
  }
  
  return null
}

// Main parser function
export function parseCommand(input: string): ParsedCommand {
  const lower = input.toLowerCase().trim()
  
  // Check for swap commands
  if (lower.startsWith('swap') || lower.startsWith('buy') || lower.startsWith('sell')) {
    const swapResult = parseSwapCommand(input)
    if (swapResult) {
      return {
        type: 'swap',
        raw: input,
        params: swapResult.params,
        confidence: swapResult.confidence
      }
    }
  }
  
  // Check for balance
  if (lower.includes('balance') || lower.includes('bal')) {
    const balanceResult = parseBalanceCommand(input)
    if (balanceResult) {
      return {
        type: 'balance',
        raw: input,
        params: balanceResult.params,
        confidence: balanceResult.confidence
      }
    }
  }
  
  // Check for yield
  if (lower.includes('yield') || lower.includes('apy') || lower.includes('earn')) {
    return {
      type: 'yield',
      raw: input,
      params: {},
      confidence: 0.95
    }
  }
  
  // Check for monitor
  if (lower.startsWith('watch') || lower.startsWith('monitor') || lower.includes('alert')) {
    const monitorResult = parseMonitorCommand(input)
    if (monitorResult) {
      return {
        type: 'monitor',
        raw: input,
        params: monitorResult.params,
        confidence: monitorResult.confidence
      }
    }
  }
  
  // Check for status
  if (lower.includes('status') || lower.includes('system') || lower.includes('health')) {
    return {
      type: 'status',
      raw: input,
      params: {},
      confidence: 0.9
    }
  }
  
  // Check for help
  if (lower === 'help' || lower === '?' || lower === 'commands') {
    return {
      type: 'help',
      raw: input,
      params: {},
      confidence: 1.0
    }
  }
  
  // Unknown command
  return {
    type: 'unknown',
    raw: input,
    params: {},
    confidence: 0
  }
}

// Generate help text
export function getHelpText(): string {
  return `AVAILABLE COMMANDS:

SWAP:
  swap<amount> <tokenIn> for <tokenOut>
  buy<amount> <tokenOut> with <tokenIn>
  sell<tokenIn> for <tokenOut>
  swap<tokenIn> for <tokenOut> when <token> < ><price>

BALANCE:
  balance - Show all balances
  balance <token> - Show specific token balance

YIELD:
  yield - Show available yields
  apy - Alias for yield

MONITOR:
  watch <token>, sell when <price>
  alert<token> when <price>

SYSTEM:
  status - System health check
  help - Show this message`
}
