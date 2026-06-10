'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Zap, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { CONTRACTS, MANTLE_SEPOLIA } from '@/lib/contracts'

interface MintResult {
  tokenId?: number
  txHash?: string
  success?: boolean
}

export function AgentCard() {
  const { address, isConnected } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<MintResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalAgents, setTotalAgents] = useState<number | null>(null)

  // Fetch total agents on mount
  useEffect(() => {
    fetch('/api/mint')
      .then(res => res.json())
      .then(data => {
        if (data.totalAgents) {
          setTotalAgents(parseInt(data.totalAgents))
        }
      })
      .catch(() => {})
  }, [])

  const handleMint = async () => {
    if (!address) return
    setIsMinting(true)
    setError(null)
    setMintResult(null)
    
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          agentName: 'MantlicAgent' 
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        setMintResult({ 
          tokenId: data.tokenId, 
          txHash: data.txHash,
          success: true 
        })
      } else {
        setError(data.error || 'Minting failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    }
    setIsMinting(false)
  }

  // Check if contract is actually deployed
  const contractDeployed = !CONTRACTS.AGENT_REGISTRY.startsWith('0x0000000')

  if (!isConnected) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Agent Identity</h3>
            <p className="text-slate-400 text-xs">Connect wallet to mint</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Connect your wallet to mint your ERC-8004 agent identity.</p>
      </div>
    )
  }

  if (mintResult?.success) {
    return (
      <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-4 border border-green-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Agent Identity NFT</h3>
            <p className="text-green-400 text-xs">ERC-8004 Compliant</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Token ID</span>
            <span className="text-white">#{mintResult.tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Owner</span>
            <span className="text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
          {totalAgents !== null && (
            <div className="flex justify-between">
              <span className="text-slate-400">Total Agents</span>
              <span className="text-green-400">{totalAgents}</span>
            </div>
          )}
          {mintResult.txHash && (
            <a 
              href={`${MANTLE_SEPOLIA.explorer}/tx/${mintResult.txHash}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs mt-2"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <a 
          href={`${MANTLE_SEPOLIA.explorer}/address/${CONTRACTS.AGENT_REGISTRY}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-center text-xs text-slate-400 hover:text-white"
        >
          Contract: {CONTRACTS.AGENT_REGISTRY.slice(0, 10)}...{CONTRACTS.AGENT_REGISTRY.slice(-6)}
        </a>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-medium">Agent Identity</h3>
          <p className="text-slate-400 text-xs">ERC-8004 NFT on Mantle</p>
        </div>
      </div>

      {/* Contract Status */}
      <div className="flex items-center gap-2 mb-3">
        {contractDeployed ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-xs">Contract Deployed</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs">Contract Pending</span>
          </>
        )}
        {totalAgents !== null && (
          <span className="ml-auto text-xs text-slate-500">{totalAgents} agents</span>
        )}
      </div>

      <p className="text-slate-400 text-sm mb-3">
        Mint your AI agent identity as an on-chain NFT. Establish your agent&apos;s reputation permanently.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-500/20 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      <button 
        onClick={handleMint} 
        disabled={!address || isMinting || !contractDeployed}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2"
      >
        {isMinting ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Minting...</>
        ) : (
          <><Zap className="w-4 h-4" />Mint Agent NFT</>
        )}
      </button>

      <a 
        href={`${MANTLE_SEPOLIA.explorer}/address/${CONTRACTS.AGENT_REGISTRY}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-center text-xs text-slate-500 hover:text-slate-400"
      >
        View Contract →
      </a>
    </div>
  )
}
