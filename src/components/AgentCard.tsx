'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Zap, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { CONTRACTS, MANTLE_SEPOLIA } from '@/lib/contracts'

interface AgentCardProps {
  agentName?: string
  tokenId?: number
  txHash?: string
}

// Check if contract is deployed (not the placeholder address)
const isContractDeployed = CONTRACTS.AGENT_REGISTRY !== '0x0000000000000000000000000000000000000001'

export function AgentCard({ agentName, tokenId, txHash }: AgentCardProps) {
  const { address } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<{ tokenId: number; txHash: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMint = async () => {
    if (!address) return
    setIsMinting(true)
    setError(null)
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, agentName: agentName || 'MantlicAgent' }),
      })
      const data = await res.json()
      
      if (!data.success) {
        setError(data.error)
        return
      }
      
      setMintResult({ tokenId: data.tokenId, txHash: data.txHash })
    } catch (err) {
      console.error(err)
      setError('Failed to mint agent NFT')
    }
    setIsMinting(false)
  }

  // Show contract status indicator
  const ContractStatus = () => {
    if (isContractDeployed) {
      return (
        <div className="flex items-center gap-1 text-green-400 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Contract Deployed</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-amber-400 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>Contract Pending Deployment</span>
      </div>
    )
  }

  if (mintResult) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Agent Identity NFT</h3>
              <p className="text-purple-400 text-xs">ERC-8004 Compliant</p>
            </div>
          </div>
          <ContractStatus />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Token ID</span><span className="text-white">#{mintResult.tokenId}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span></div>
          <a href={`${MANTLE_SEPOLIA.explorer}/tx/${mintResult.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs mt-2">
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Agent Identity</h3>
            <p className="text-slate-400 text-xs">ERC-8004 NFT</p>
          </div>
        </div>
        <ContractStatus />
      </div>
      <p className="text-slate-400 text-sm mb-3">Mint your AI agent identity as an on-chain NFT. This establishes your agent's reputation and history.</p>
      
      {error && (
        <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-xs mb-2">{error}</p>
          {!isContractDeployed && (
            <a 
              href="https://remix.ethereum.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-xs underline"
            >
              View Deployment Guide
            </a>
          )}
        </div>
      )}
      
      <button onClick={handleMint} disabled={!address || isMinting} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2">
        {isMinting ? <><Loader2 className="w-4 h-4 animate-spin" />Minting...</> : <><Zap className="w-4 h-4" />Mint Agent NFT</>}
      </button>
    </div>
  )
}
