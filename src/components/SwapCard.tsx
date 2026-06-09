'use client'
import { useState } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ArrowDownUp, Loader2 } from 'lucide-react'

export function SwapCard() {
  const { address, isConnected } = useAccount()
  const { data: mntBalance } = useBalance({ address })
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { writeContract, isPending } = useWriteContract()

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    setIsLoading(true)
    
    // Demo: Show swap simulation
    // In production: integrate with Camelot DEX or 0x API
    setTimeout(() => {
      setToAmount((parseFloat(fromAmount) * 0.85).toFixed(4)) // Mock 15% slippage
      setIsLoading(false)
    }, 1500)
  }

  const handleMax = () => {
    if (mntBalance) {
      const maxAmount = parseFloat(formatEther(mntBalance.value)) * 0.99 // Leave some for gas
      setFromAmount(maxAmount.toFixed(4))
    }
  }

  if (!isConnected) return null

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
        <ArrowDownUp className="w-4 h-4 text-cyan-400" />
        Swap MNT
      </h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">From</span>
            <span className="text-slate-400">Balance: {mntBalance ? parseFloat(mntBalance.formatted).toFixed(4) : '0'} {mntBalance?.symbol}</span>
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
        
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <ArrowDownUp className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">To</span>
            <span className="text-slate-400">Est. Output</span>
          </div>
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500"
          />
        </div>
        
        <div className="text-xs text-slate-500 text-center">
          Rate: 1 MNT ≈ 0.85 sUSDe (simulated)
        </div>
        
        <button
          onClick={handleSwap}
          disabled={!fromAmount || isLoading || isPending}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-medium transition-all flex items-center justify-center gap-2"
        >
          {isLoading || isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
          ) : (
            'Swap'
          )}
        </button>
      </div>
    </div>
  )
}
