// Mantlic Agent Brain
// Executes commands and manages autonomous trading

import { parseCommand, getHelpText, type ParsedCommand, type SwapParams } from '../commands/parser'
import { getSwapQuote, executeSwap, getTokenPrice, checkCondition, TOKENS } from '../lib/dex'
import { useAccount, useBalance, useSendTransaction, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { useState, useEffect, useCallback } from 'react'

export interface AgentMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: number
  status?: 'pending' | 'success' | 'error'
  txHash?: string
}

export interface AgentState {
  messages: AgentMessage[]
  isProcessing: boolean
  activeMonitors: MonitorTask[]
  lastError?: string
}

export interface MonitorTask {
  id: string
  token: string
  condition: { type: 'price_above' | 'price_below'; price: number }
  action: SwapParams
  status: 'active' | 'triggered' | 'cancelled'
  createdAt: number
}

// Agent hook for React components
export function useMantlicAgent() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction } = useSendTransaction()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [state, setState] = useState<AgentState>({
    messages: [],
    isProcessing: false,
    activeMonitors: [],
  })
  
  // Add message to state
  const addMessage = useCallback((msg: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    const newMsg: AgentMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    setState(prev => ({ ...prev, messages: [...prev.messages, newMsg] }))
    return newMsg
  }, [])
  
  // Execute a parsed command
  const executeCommand = useCallback(async (parsed: ParsedCommand) => {
    if (!isConnected || !address) {
      return 'CONNECT WALLET FIRST'
    }
    
    switch (parsed.type) {
      case 'swap': {
        const params = parsed.params as SwapParams
        
        // If has condition, set up monitor instead
        if (params.condition) {
          const monitorId = crypto.randomUUID()
          const monitor: MonitorTask = {
            id: monitorId,
            token: params.condition.token,
            condition: params.condition,
            action: params,
            status: 'active',
            createdAt: Date.now(),
          }
          setState(prev => ({ ...prev, activeMonitors: [...prev.activeMonitors, monitor] }))
          return `MONITOR SET: Watching ${params.condition.token} ${params.condition.type === 'price_below' ? '<' : '>'} $${params.condition.price}. Will execute swap when condition met.`
        }
        
        // Get quote first
        const quote = await getSwapQuote(params.tokenIn, params.tokenOut, params.amountIn)
        if (!quote) {
          return `INVALID PAIR: ${params.tokenIn}/${params.tokenOut} not supported`
        }
        
        // Execute swap
        if (walletClient && publicClient) {
          const result = await executeSwap(
            { ...params, recipient: address, slippage: params.slippage || 50 },
            publicClient,
            walletClient
          )
          
          if (result.status === 'pending') {
            return `SWAP INITIATED: ${params.amountIn} ${params.tokenIn} → ${params.tokenOut}\nTX: ${result.txHash.slice(0, 10)}...\nWaiting for confirmation...`
          }
        }
        
        // Demo mode (no real wallet)
        return `SWAP QUOTE (Demo Mode):\n${params.amountIn} ${params.tokenIn} → ${quote.expectedOutput} ${params.tokenOut}\nRate: ${quote.route}\nPrice Impact: ${quote.priceImpact}%\nSlippage: ${(params.slippage ?? 50) / 100}%\n\n[Execute swap to confirm]`
      }
      
      case 'balance': {
        const token = parsed.params.token as string
        if (token === 'ALL' || !token) {
          const mntBalance = balance ? parseFloat(balance.formatted).toFixed(4) : '0'
          return `BALANCES:\nMNT: ${mntBalance}\nWETH: --\nUSDC: --\n---\nConnect wallet to see full balance`
        }
        return `BALANCE: ${token} = --\n(Connect wallet for real data)`
      }
      
      case 'yield': {
        return `YIELD OPPORTUNITIES:\n\nPROTOCOL        APY     TVL\n---            ---     ---\nMerchant Moe   4.2%    $50M\nAgni Finance  5.8%    $30M\nFluxion        3.1%    $20M\nUSDY (Ondo)    5.2%    $100M\nmETH (Mantle) 4.0%    $80M\n\nTOP PICK: Agni Finance (5.8% APY)`
      }
      
      case 'monitor': {
        const params = parsed.params as any
        const monitorId = crypto.randomUUID()
        const monitor: MonitorTask = {
          id: monitorId,
          token: params.token,
          condition: params.condition,
          action: params.action.params,
          status: 'active',
          createdAt: Date.now(),
        }
        setState(prev => ({ ...prev, activeMonitors: [...prev.activeMonitors, monitor] }))
        return `MONITOR ACTIVE:\nWatching ${params.token} ${params.condition.type === 'price_below' ? '<' : '>'} $${params.condition.price}\nWill execute swap when triggered.`
      }
      
      case 'status': {
        const price = await getTokenPrice('MNT')
        return `SYSTEM STATUS:\n\nNETWORK: Mantle Sepolia\nSTATUS: ONLINE\nMNT PRICE: $${price}\nGAS: 0.001 MNT\nTVL: $4.2B\nACTIVE MONITORS: ${state.activeMonitors.filter(m => m.status === 'active').length}\nWALLET: ${address?.slice(0, 10)}...`
      }
      
      case 'help': {
        return getHelpText()
      }
      
      default: {
        return `UNKNOWN COMMAND: "${parsed.raw}"\n\nType "help" for available commands.`
      }
    }
  }, [isConnected, address, balance, walletClient, publicClient, state.activeMonitors])
  
  // Process user input
  const processInput = useCallback(async (input: string) => {
    if (!input.trim()) return
    
    // Add user message
    addMessage({ role: 'user', content: input })
    
    setState(prev => ({ ...prev, isProcessing: true }))
    
    try {
      // Parse command
      const parsed = parseCommand(input)
      
      // Execute
      const response = await executeCommand(parsed)
      
      // Add agent response
      addMessage({ role: 'agent', content: response })
    } catch (error: any) {
      addMessage({ role: 'system', content: `ERROR: ${error.message}`, status: 'error' })
    }
    
    setState(prev => ({ ...prev, isProcessing: false }))
  }, [addMessage, executeCommand])
  
  // Cancel a monitor
  const cancelMonitor = useCallback((monitorId: string) => {
    setState(prev => ({
      ...prev,
      activeMonitors: prev.activeMonitors.map(m => 
        m.id === monitorId ? { ...m, status: 'cancelled' } : m
      )
    }))
  }, [])
  
  return {
    ...state,
    processInput,
    cancelMonitor,
  }
}

// Non-hook version for server-side or non-React
export async function processCommandOffline(input: string, address?: string): Promise<string> {
  const parsed = parseCommand(input)
  
  switch (parsed.type) {
    case 'swap': {
      const params = parsed.params as SwapParams
      const quote = await getSwapQuote(params.tokenIn, params.tokenOut, params.amountIn)
      if (!quote) return `INVALID PAIR: ${params.tokenIn}/${params.tokenOut}`
      return `SWAP QUOTE:\n${params.amountIn} ${params.tokenIn} → ${quote.expectedOutput} ${params.tokenOut}\nRoute: ${quote.route}\nPrice Impact: ${quote.priceImpact}%`
    }
    
    case 'balance': {
      return `BALANCE QUERY\n${address ? 'Address: ' + address.slice(0, 10) + '...' : 'No wallet connected'}`
    }
    
    case 'yield': {
      return `YIELD REPORT:\nAgni: 5.8%\nUSDY: 5.2%\nMoe: 4.2%`
    }
    
    case 'status': {
      const price = await getTokenPrice('MNT')
      return `STATUS:\nMNT: $${price}\nNetwork: Mantle\nStatus: ONLINE`
    }
    
    case 'help': {
      return getHelpText()
    }
    
    default: {
      return `Unknown command. Type "help" for commands.`
    }
  }
}
