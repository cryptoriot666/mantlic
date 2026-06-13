'use client'
import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useReadContract } from 'wagmi'
import { CONTRACTS } from '@/lib/contracts'
import { mantleSepolia } from '@/lib/wagmi'

interface LeaderboardEntry {
  rank: number
  agent: string
  score: number
  swapVolume: string
  change: 'up' | 'down' | 'same'
  trades: number
}

// ABI for agent registry
const REGISTRY_ABI = [
  {
    name: 'getAgentCount',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getAgent',
    type: 'function',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'metadataURI', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'reputation', type: 'int256' },
          { name: 'capabilities', type: 'bytes' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    name: 'getReputationScore',
    type: 'function',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ type: 'int256' }],
    stateMutability: 'view',
  },
] as const

export function Leaderboard() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Read agent count
  const { data: agentCount } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getAgentCount',
    chainId: mantleSepolia.id,
  })
  
  // Read agent 1 (Mantlic-Alpha)
  const { data: agent1 } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getAgent',
    args: [1n],
    chainId: mantleSepolia.id,
  })
  
  const { data: rep1 } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getReputationScore',
    args: [1n],
    chainId: mantleSepolia.id,
  })
  
  useEffect(() => {
    if (agentCount === undefined) return
    
    setIsLoading(false)
    
    if (!agentCount || agentCount === 0n) {
      setEntries(getDemoEntries())
      return
    }
    
    // Build leaderboard from on-chain data
    const onChain: LeaderboardEntry[] = []
    
    if (agent1 && rep1 !== undefined) {
      onChain.push({
        rank: 1,
        agent: agent1.name || 'Mantlic-Alpha',
        score: Number(rep1),
        swapVolume: '-',
        change: 'up',
        trades: 0,
      })
    }
    
    // If we have real agents, use them + fill with demo
    if (onChain.length > 0) {
      const demo = getDemoEntries().filter(d => !onChain.find(o => o.agent === d.agent))
      setEntries([...onChain, ...demo].slice(0, 8).map((e, i) => ({ ...e, rank: i + 1 })))
    } else {
      setEntries(getDemoEntries())
    }
  }, [agentCount, agent1, rep1])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-mono text-sm">{rank}</span>
  }
  
  const getChangeIcon = (change: LeaderboardEntry['change']) => {
    if (change === 'up') return <TrendingUp className="w-3 h-3 text-green-400" />
    if (change === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />
    return <Minus className="w-3 h-3 text-gray-500" />
  }
  
  return (
    <div className="bg-[#0f0f15] rounded-xl border border-[#00ff88]/30 overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 border-b border-[#00ff88]/20 flex items-center justify-between hover:bg-[#00ff88]/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#00ff88]" />
          <span className="font-bold text-white">AGENT LEADERBOARD</span>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#00ff88]" />}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="divide-y divide-[#00ff88]/10">
          {entries.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3 p-3 hover:bg-[#00ff88]/5 transition-colors">
              {getRankIcon(entry.rank)}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-white truncate">{entry.agent}</div>
                <div className="text-xs text-gray-500">{entry.swapVolume} • {entry.trades} trades</div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="font-mono text-[#00ff88] font-bold">{entry.score.toLocaleString()}</div>
                {getChangeIcon(entry.change)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isExpanded && entries.length > 0 && (
        <div className="p-3 text-center text-xs text-gray-500">
          Top agent: <span className="text-[#00ff88]">{entries[0]?.agent}</span> ({entries[0]?.score.toLocaleString()} pts)
        </div>
      )}
    </div>
  )
}

// Compact leaderboard for sidebar
export function CompactLeaderboard() {
  const [top3, setTop3] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { data: agentCount } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getAgentCount',
    chainId: mantleSepolia.id,
  })
  
  const { data: agent1 } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getAgent',
    args: [1n],
    chainId: mantleSepolia.id,
  })
  
  const { data: rep1 } = useReadContract({
    address: CONTRACTS.AGENT_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: 'getReputationScore',
    args: [1n],
    chainId: mantleSepolia.id,
  })
  
  useEffect(() => {
    if (agentCount === undefined) return
    setIsLoading(false)
    
    if (!agentCount || agentCount === 0n) {
      setTop3(getDemoEntries().slice(0, 3))
      return
    }
    
    if (agent1 && rep1 !== undefined) {
      setTop3([{
        rank: 1,
        agent: agent1.name || 'Mantlic-Alpha',
        score: Number(rep1),
        swapVolume: '-',
        change: 'up',
        trades: 0,
      }])
    } else {
      setTop3(getDemoEntries().slice(0, 3))
    }
  }, [agentCount, agent1, rep1])
  
  return (
    <div className="bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[#00ff88]" />
        <span className="text-xs font-bold text-white">TOP AGENTS</span>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#00ff88]" />}
      </div>
      <div className="space-y-2">
        {top3.map((entry) => (
          <div key={entry.rank} className="flex items-center gap-2 text-xs">
            <span className={`w-4 text-center font-mono ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
              #{entry.rank}
            </span>
            <span className="flex-1 text-gray-300 truncate">{entry.agent}</span>
            <span className="text-[#00ff88] font-mono">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getDemoEntries(): LeaderboardEntry[] {
  return [
    { rank: 1, agent: 'Mantlic-Alpha', score: 8900, swapVolume: '$42K', change: 'up', trades: 156 },
    { rank: 2, agent: 'Agent-77', score: 8450, swapVolume: '$28K', change: 'same', trades: 98 },
    { rank: 3, agent: 'TurboTrader', score: 8200, swapVolume: '$19K', change: 'down', trades: 87 },
    { rank: 4, agent: 'DeFi-DaVinci', score: 7900, swapVolume: '$15K', change: 'up', trades: 72 },
    { rank: 5, agent: 'MantleMaxi', score: 7600, swapVolume: '$12K', change: 'same', trades: 64 },
    { rank: 6, agent: 'SwapWizard', score: 7200, swapVolume: '$9K', change: 'up', trades: 45 },
    { rank: 7, agent: 'YieldHunter', score: 6800, swapVolume: '$7K', change: 'down', trades: 38 },
    { rank: 8, agent: 'CryptoBot-v2', score: 6500, swapVolume: '$5K', change: 'same', trades: 29 },
  ]
}
