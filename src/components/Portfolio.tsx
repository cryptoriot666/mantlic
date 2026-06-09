'use client'
import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function Portfolio() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  
  if (!isConnected || !balance) return null
  
  const mntValue = parseFloat(balance.formatted)
  
  // Mock data for demo
  const mockPositions = [
    { name: 'MNT', amount: mntValue.toFixed(4), value: mntValue, change: '+2.5%', positive: true },
    { name: 'sUSDe', amount: '0.00', value: 0, change: '-0.2%', positive: false },
    { name: 'USDC', amount: '0.00', value: 0, change: '+0.1%', positive: true },
  ]
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          Portfolio
        </h3>
        <span className="text-xs text-slate-400">Mantle Sepolia</span>
      </div>
      
      <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
        <p className="text-slate-400 text-sm">Total Value</p>
        <p className="text-2xl font-bold text-white">${mntValue.toFixed(2)}</p>
      </div>
      
      <div className="space-y-2">
        {mockPositions.filter(p => p.value > 0).map((position, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-white text-sm">{position.name}</p>
                <p className="text-slate-500 text-xs">{position.amount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">${position.value.toFixed(2)}</p>
              <p className={`text-xs flex items-center justify-end gap-1 ${position.positive ? 'text-green-400' : 'text-red-400'}`}>
                {position.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {position.change}
              </p>
            </div>
          </div>
        ))}
        
        {mntValue === 0 && (
          <div className="text-center py-4 text-slate-500 text-sm">
            No assets yet. Get test MNT from faucet.
          </div>
        )}
      </div>
    </div>
  )
}
