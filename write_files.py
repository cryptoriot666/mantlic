import os

# Create directories
os.makedirs('C:/Users/nandacamp/mantlic/src/app/api/chat', exist_ok=True)
os.makedirs('C:/Users/nandacamp/mantlic/src/app/api/mint', exist_ok=True)

# File 1: chat route
chat_route = '''import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, address } = await req.json()
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are Mantlic, an AI agent wallet on Mantle blockchain.
- You help users manage their crypto wallet through conversation.
- Always confirm before making transactions.
- Be concise and security-first.
- If asked about balance, tell them to check their connected wallet.
- User wallet address: ${address || 'not connected'}`,
    messages,
  })
  return result.toDataStreamResponse()
}
'''

# File 2: mint route
mint_route = '''import { NextRequest, NextResponse } from 'next/server'
import { encodeFunctionData, parseEther } from 'viem'
import { mantleSepolia } from '@/lib/wagmi'

// Minimal ERC-8004 inspired agent identity contract on Mantle testnet
const AGENT_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export async function POST(req: NextRequest) {
  const { address, agentName } = await req.json()
  
  if (!address || !agentName) {
    return NextResponse.json({ error: 'Missing address or agentName' }, { status: 400 })
  }

  // For demo: return a mock "mint" result
  // In production, this would call the ERC-8004 contract on Mantle
  const mockTokenId = Math.floor(Math.random() * 1000000)
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  
  return NextResponse.json({
    success: true,
    tokenId: mockTokenId,
    txHash,
    agentName,
    owner: address,
    chain: 'mantle-sepolia',
    message: 'Agent identity NFT minted successfully (Demo mode)',
    explorerUrl: `https://explorer.sepolia.mantle.xyz/tx/${txHash}`
  })
}
'''

# File 3: AgentCard component
agent_card = '''\'use client\'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Zap, ExternalLink, Loader2 } from 'lucide-react'

interface AgentCardProps {
  agentName?: string
  tokenId?: number
  txHash?: string
}

export function AgentCard({ agentName, tokenId, txHash }: AgentCardProps) {
  const { address } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<{ tokenId: number; txHash: string } | null>(null)

  const handleMint = async () => {
    if (!address) return
    setIsMinting(true)
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, agentName: agentName || 'MantlicAgent' }),
      })
      const data = await res.json()
      setMintResult({ tokenId: data.tokenId, txHash: data.txHash })
    } catch (err) {
      console.error(err)
    }
    setIsMinting(false)
  }

  if (mintResult) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Agent Identity NFT</h3>
            <p className="text-purple-400 text-xs">ERC-8004 Compliant</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Token ID</span><span className="text-white">#{mintResult.tokenId}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span></div>
          <a href={`https://explorer.sepolia.mantle.xyz/tx/${mintResult.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs mt-2">
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
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
          <p className="text-slate-400 text-xs">ERC-8004 NFT</p>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-3">Mint your AI agent identity as an on-chain NFT. This establishes your agent&apos;s reputation and history.</p>
      <button onClick={handleMint} disabled={!address || isMinting} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2">
        {isMinting ? <><Loader2 className="w-4 h-4 animate-spin" />Minting...</> : <><Zap className="w-4 h-4" />Mint Agent NFT</>}
      </button>
    </div>
  )
}
'''

# File 4: .env.example
env_example = '''# Required
OPENAI_API_KEY=sk-......
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional - for production deployment
'''

# Write files
with open('C:/Users/nandacamp/mantlic/src/app/api/chat/route.ts', 'w') as f:
    f.write(chat_route)
print('Written: src/app/api/chat/route.ts')

with open('C:/Users/nandacamp/mantlic/src/app/api/mint/route.ts', 'w') as f:
    f.write(mint_route)
print('Written: src/app/api/mint/route.ts')

with open('C:/Users/nandacamp/mantlic/src/components/AgentCard.tsx', 'w') as f:
    f.write(agent_card)
print('Written: src/components/AgentCard.tsx')

with open('C:/Users/nandacamp/mantlic/.env.example', 'w') as f:
    f.write(env_example)
print('Written: .env.example')

print('All files written successfully!')
