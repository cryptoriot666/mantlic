'use client'
import { useState } from 'react'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  agent: string
  score: number
  swapVolume: string
  change: 'up' | 'down' | 'same'
  trades: number
}

export function Leaderboard() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [entries] = useState<LeaderboardEntry[]>([
    { rank: 1, agent: 'Mantlic-Alpha', score: 8900, swapVolume: '$42K', change: 'up', trades: 156 },
    { rank: 2, agent: 'Agent-77', score: 8450, swapVolume: '$28K', change: 'same', trades: 98 },
    { rank: 3, agent: 'TurboTrader', score: 8200, swapVolume: '$19K', change: 'down', trades: 87 },
    { rank: 4, agent: 'DeFi-DaVinci', score: 7900, swapVolume: '$15K', change: 'up', trades: 72 },
    { rank: 5, agent: 'MantleMaxi', score: 7600, swapVolume: '$12K', change: 'same', trades: 64 },
    { rank: 6, agent: 'SwapWizard', score: 7200, swapVolume: '$9K', change: 'up', trades: 45 },
    { rank: 7, agent: 'YieldHunter', score: 6800, swapVolume: '$7K', change: 'down', trades: 38 },
    { rank: 8, agent: 'CryptoBot-v2', score: 6500, swapVolume: '$5K', change: 'same', trades: 29 },
  ])
  
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
      
      {!isExpanded && (
        <div className="p-3 text-center text-xs text-gray-500">
          Top agent: <span className="text-[#00ff88]">Mantlic-Alpha</span> (8,900 pts)
        </div>
      )}
    </div>
  )
}

// Compact leaderboard for sidebar
export function CompactLeaderboard() {
  const [top3] = useState<LeaderboardEntry[]>([
    { rank: 1, agent: 'Mantlic-Alpha', score: 8900, swapVolume: '$42K', change: 'up', trades: 156 },
    { rank: 2, agent: 'Agent-77', score: 8450, swapVolume: '$28K', change: 'same', trades: 98 },
    { rank: 3, agent: 'TurboTrader', score: 8200, swapVolume: '$19K', change: 'down', trades: 87 },
  ])
  
  return (
    <div className="bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[#00ff88]" />
        <span className="text-xs font-bold text-white">TOP AGENTS</span>
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
