'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { getMNTPrice } from '@/lib/1inch'
import { CONTRACTS } from '@/lib/contracts'
import { mantleSepolia } from '@/lib/wagmi'

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
    name: 'getQuote',
    type: 'function',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'slippageBps', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }, { type: 'uint256' }],
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
    name: 'feeBps',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

const MNT_NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const NATIVE_LABEL = 'MNT'

interface SwapResult {
  txHash: string
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  price: string
  status: 'pending' | 'success' | 'error'
}

interface SwapCardProps {
  onSwapComplete?: (result: SwapResult) => void
}

export function SwapCard({ onSwapComplete }: SwapCardProps) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: mantleSepolia.id })
  const { data: mntBalance } = useBalance({ address })
  
  const [fromToken, setFromToken] = useState('MNT')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [price, setPrice] = useState('')
  const [slippage, setSlippage] = useState(50) // 0.5% default
  const [isLoading, setIsLoading] = useState(false)
  const [isQuoting, setIsQuoting] = useState(false)
  const [error, setError] = useState('')
  
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  // Auto-quote when amount changes
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !isConnected || !publicClient) {
      setToAmount('')
      setPrice('')
      return
    }
    
    const timer = setTimeout(async () => {
      setIsQuoting(true)
      setError('')
      try {
        const mntPrice = await getMNTPrice()
        const decimals = fromToken === 'MNT' ? 18 : 6
        
        if (fromToken === 'MNT' && toToken === 'USDC') {
          const amountIn = parseFloat(fromAmount)
          const amountOut = (amountIn * mntPrice).toFixed(6)
          setToAmount(amountOut)
          setPrice(`$${mntPrice.toFixed(3)}/MNT`)
        } else if (fromToken === 'USDC' && toToken === 'MNT') {
          const amountIn = parseFloat(fromAmount)
          const amountOut = (amountIn / mntPrice).toFixed(6)
          setToAmount(amountOut)
          setPrice(`$${mntPrice.toFixed(3)}/MNT`)
        } else {
          setToAmount((parseFloat(fromAmount) * 0.95).toFixed(6))
          setPrice('Market rate')
        }
      } catch (err) {
        console.error('Quote error:', err)
        setError('Failed to get quote')
      } finally {
        setIsQuoting(false)
      }
    }, 800)
    
    return () => clearTimeout(timer)
  }, [fromAmount, fromToken, toToken, isConnected, publicClient])

  // Handle swap execution via MantlicSwap
  const handleSwap = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !address) return
    
    setIsLoading(true)
    setError('')
    reset()
    
    try {
      const decimals = fromToken === 'MNT' ? 18 : 6
      const amountIn = parseUnits(fromAmount, decimals)
      const tokenIn = fromToken === 'MNT' ? MNT_NATIVE : CONTRACTS.MOCK_USDC
      const tokenOut = toToken === 'MNT' ? MNT_NATIVE : CONTRACTS.MOCK_USDC
      
      writeContract({
        address: CONTRACTS.MANTLIC_SWAP as `0x${string}`,
        abi: SWAP_ABI,
        functionName: 'executeSwap',
        value: fromToken === 'MNT' ? amountIn : 0n,
        args: [tokenIn, tokenOut, amountIn, 0n, '0x'],
      })
    } catch (err: any) {
      console.error('Swap error:', err)
      setError(err?.shortMessage || err?.message || 'Swap failed')
      setIsLoading(false)
    }
  }, [fromAmount, fromToken, toToken, address, writeContract, reset])

  // Handle tx confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setIsLoading(false)
      onSwapComplete?.({
        txHash,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        price: price || 'Market rate',
        status: 'success',
      })
    }
  }, [isConfirmed, txHash, fromToken, toToken, fromAmount, toAmount, price, onSwapComplete])

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Transaction failed')
      setIsLoading(false)
    }
  }, [writeError])

  const handleMax = () => {
    if (mntBalance) {
      const maxAmount = parseFloat(formatUnits(mntBalance.value, mntBalance.decimals)) * 0.99
      setFromAmount(maxAmount.toFixed(6))
    }
  }

  const isProcessing = isLoading || isWritePending || isConfirming

  if (!isConnected) return null

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
        <ArrowDownUp className="w-4 h-4 text-cyan-400" />
        Swap MNT ↔ USDC
        <span className="ml-auto text-xs text-[#00ff88] font-mono">MantlicSwap</span>
      </h3>
      
      <div className="space-y-3">
        {/* From */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">From</span>
            <span className="text-slate-400">
              Balance: {mntBalance ? parseFloat(mntBalance.formatted).toFixed(4) : '0'} {mntBalance?.symbol}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={handleMax} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 rounded-lg text-sm">
              MAX
            </button>
          </div>
        </div>
        
        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <ArrowDownUp className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        
        {/* To */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">To</span>
            <span className="text-slate-400">
              {isQuoting ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                'Est. Output'
              )}
            </span>
          </div>
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500"
          />
        </div>
        
        {/* Price info */}
        {price && (
          <div className="text-xs text-slate-500 text-center">
            Rate: {price} • Slippage: {(slippage / 100).toFixed(1)}%
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
        
        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isProcessing || !toAmount}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-medium transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isWritePending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : 'Processing...'}
            </>
          ) : (
            <>
              <ArrowDownUp className="w-4 h-4" />
              Swap {fromToken} → {toToken}
            </>
          )}
        </button>
        
        {/* TX Hash display */}
        {txHash && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-slate-900/30 rounded-lg px-3 py-2">
            <span>TXN:</span>
            <span className="truncate flex-1 text-cyan-400/60">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            <a
              href={`https://sepolia.mantlescan.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        {/* Success */}
        {isConfirmed && (
          <div className="flex items-center gap-2 text-xs text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3 h-3" />
            Swap confirmed on-chain!
          </div>
        )}
      </div>
    </div>
  )
}
