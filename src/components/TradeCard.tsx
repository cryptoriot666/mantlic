'use client'
import { useState } from 'react'
import { Copy, Check, Share2, X, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'

interface TradeCardProps {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  price: string
  change: 'up' | 'down'
  txHash?: string
  onClose?: () => void
}

export function TradeCard({ fromToken, toToken, fromAmount, toAmount, price, change, txHash, onClose }: TradeCardProps) {
  const [copied, setCopied] = useState(false)
  
  const shareText = `I just swapped ${fromAmount} ${fromToken} → ${toAmount} ${toToken} on @MantleNetwork via @MantlicAgent! 🚀`
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  const copyLink = () => {
    navigator.clipboard.writeText(`${shareUrl}${txHash ? `?tx=${txHash}` : ''}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }
  
  const viewOnExplorer = () => {
    if (txHash) {
      window.open(`https://explorer.sepolia.mantle.xyz/tx/${txHash}`, '_blank')
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-[#0f0f15] to-[#0a1a1a] rounded-xl border border-[#00ff88]/30 p-4 max-w-sm w-full relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-[#00ff88]/10 text-gray-500 hover:text-white transition-colors"
        >
          ×
        </button>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {change === 'up' ? (
            <TrendingUp className="w-5 h-5 text-[#00ff88]" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs font-mono text-[#00ff88]">SWAP</span>
        </div>
        <span className="text-xs font-mono text-gray-500">{price}</span>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-black text-white">{fromAmount}</div>
          <div className="text-xs text-gray-500">{fromToken}</div>
        </div>
        <div className="text-[#00ff88] text-2xl">→</div>
        <div className="flex-1 text-center">
          <div className="text-xl font-black text-[#00ff88]">{toAmount}</div>
          <div className="text-xs text-gray-500">{toToken}</div>
        </div>
      </div>
      
      {txHash && (
        <div className="flex items-center gap-2 text-xs font-mono text-gray-600 mb-3">
          <span>TXN:</span>
          <span className="truncate flex-1">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          <button 
            onClick={viewOnExplorer}
            className="p-1 rounded hover:bg-[#00ff88]/10 text-gray-500 hover:text-[#00ff88] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        <button onClick={copyLink} className="flex-1 btn-glow bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#00ff88]/20 transition-colors">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'COPIED!' : 'COPY'}
        </button>
        <button onClick={shareTwitter} className="flex-1 btn-glow bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#1DA1F2]/20 transition-colors">
          <X className="w-3 h-3" /> SHARE
        </button>
      </div>
    </div>
  )
}

// Demo TradeCard for showing example swap
export function DemoTradeCard() {
  return (
    <TradeCard
      fromToken="MNT"
      toToken="USDC"
      fromAmount="100"
      toAmount="95.20"
      price="$0.952/MNT"
      change="down"
      txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    />
  )
}
