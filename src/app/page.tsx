'use client'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Terminal, Send, Bot, User, Activity, Loader2, Zap, Menu, X } from 'lucide-react'
import { useAgentMemory } from '../hooks/useAgentMemory'
import { parseCommand } from '../commands/parser'
import { ViralCard } from '../components/ViralCard'
import { TradeCard } from '../components/TradeCard'
import { SwapCard } from '../components/SwapCard'
import { CompactLeaderboard } from '../components/Leaderboard'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: mntBalance } = useBalance({ address })
  const { memories, remember } = useAgentMemory(address)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `> MANTLIC TERMINAL v1.0\n> SYSTEM: OPERATIONAL\n> NETWORK: Mantle Mainnet (Chain ID: 5000)\n\nType "help" for available commands or ask me anything about DeFi on Mantle.`,
      timestamp: Date.now(),
    },
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recentSwap, setRecentSwap] = useState<{
    fromToken: string; toToken: string; fromAmount: string; toAmount: string; price: string; txHash: string; status: string
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    const intent = parseCommand(content)
    if (intent.type !== 'help' && intent.type !== 'unknown') {
      remember(`cmd_${Date.now()}`, content)
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          address: address || 'not connected',
          memories: memories.map(m => `${m.key}: ${m.value}`).join('\n'),
        }),
      })
      
      if (!response.ok) throw new Error('API error')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = `assistant-${Date.now()}`
      
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now() }])
      
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        assistantContent += decoder.decode(value)
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantContent } : m))
      }
      
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: '> ERROR: Failed to get response. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }
  
  return (
    <div className="min-h-screen text-white" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1a1a 50%, #0a0a0f 100%)'
    }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl border-b border-[#00ff88]/20" style={{ background: 'rgba(10, 10, 15, 0.9)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded hover:bg-[#00ff88]/10">
              {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-[#00ff88]" />}
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/5 border border-[#00ff88]/50 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <span className="font-mono font-bold text-lg tracking-wider">MANTLIC</span>
              <span className="hidden sm:block text-xs text-[#00ff88]/60 font-mono ml-2">// AI AGENT TERMINAL</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && mntBalance && (
              <div className="hidden sm:flex items-center gap-2 text-sm font-mono">
                <span className="text-[#00ff88]">MNT</span>
                <span className="text-gray-400">{parseFloat(mntBalance.formatted).toFixed(4)}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#00ff88]">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              ONLINE
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>
      
      {/* Layout */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - normal flow, scrolls with page */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-72 flex-shrink-0
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-[#00ff88]/20 overflow-y-auto
        `} style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1515 100%)' }}>
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#00ff88]/20">
            <span className="text-xs text-[#00ff88] font-mono font-bold">MENU</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-[#00ff88]/10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Wallet Status */}
            {isConnected ? (
              <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border border-[#00ff88]/30 rounded-xl p-4">
                <div className="text-xs text-[#00ff88] mb-2 font-mono">CONNECTED</div>
                <div className="font-mono text-sm text-white truncate">{address}</div>
                {mntBalance && (
                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    <span className="text-[#00ff88]">Balance:</span> {parseFloat(mntBalance.formatted).toFixed(4)} MNT
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0f0f15] border border-[#00ff88]/20 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-3 font-mono">Connect wallet to access DeFi</div>
                <ConnectButton />
              </div>
            )}
            
            {/* Agent Stats */}
            <div className="bg-[#0f0f15] rounded-xl border border-[#00ff88]/30 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#00ff88]" />
                </div>
                <div>
                  <div className="font-bold text-white">Mantlic-Agent</div>
                  <div className="flex items-center gap-1 text-xs text-[#00ff88]/60">
                    <Activity className="w-3 h-3" />
                    <span>ONLINE</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0a0a0f] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-[#00ff88]">8750</div>
                  <div className="text-[8px] text-gray-500">DEX</div>
                </div>
                <div className="bg-[#0a0a0f] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-[#00ff88]">8200</div>
                  <div className="text-[8px] text-gray-500">YIELD</div>
                </div>
                <div className="bg-[#0a0a0f] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-[#00ff88]">8900</div>
                  <div className="text-[8px] text-gray-500">SWAP</div>
                </div>
              </div>
            </div>
            
            {/* Viral Card */}
            {isConnected && <ViralCard />}
            
            {/* Leaderboard */}
            <CompactLeaderboard />
            
            {/* Commands */}
            <div className="bg-[#0f0f15] rounded-xl border border-[#00ff88]/30 p-4">
              <div className="text-xs text-[#00ff88] font-bold mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                COMMANDS
              </div>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { cmd: 'swap', desc: '100 MNT for USDC' },
                  { cmd: 'balance', desc: 'Show balances' },
                  { cmd: 'yield', desc: 'Compare yields' },
                  { cmd: 'leaderboard', desc: 'Top agents' },
                  { cmd: 'help', desc: 'Show all' },
                ].map(({ cmd, desc }) => (
                  <div key={cmd} className="flex items-center gap-2 text-gray-400">
                    <span className="text-[#00ff88]">›</span>
                    <span className="text-[#00ff88]">{cmd}</span>
                    <span className="text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Main */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)]">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-[#00ff88]/20 backdrop-blur-sm" style={{ background: 'rgba(10, 10, 15, 0.5)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-mono text-sm text-[#00ff88]">MANTLIC TERMINAL</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-2">// AI AGENT</span>
            </div>
          </div>
          
          {/* Swap Card */}
          {isConnected && (
            <div className="p-4 border-b border-[#00ff88]/10 bg-gradient-to-r from-transparent to-[#0a0a0f]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-gray-500">SWAP</span>
              </div>
              <SwapCard onSwapComplete={(result) => {
                setRecentSwap({
                  fromToken: result.fromToken,
                  toToken: result.toToken,
                  fromAmount: result.fromAmount,
                  toAmount: result.toAmount,
                  price: result.price,
                  txHash: result.txHash,
                  status: result.status,
                })
              }} />
            </div>
          )}
          
          {/* Recent Swap Result */}
          {recentSwap && (
            <div className="p-4 border-b border-[#00ff88]/10 bg-gradient-to-r from-transparent to-[#0a0a0f]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#00ff88]">RECENT SWAP</span>
                <span className="text-xs font-mono text-gray-500">✓ On-chain</span>
              </div>
              <TradeCard
                fromToken={recentSwap.fromToken}
                toToken={recentSwap.toToken}
                fromAmount={recentSwap.fromAmount}
                toAmount={recentSwap.toAmount}
                price={recentSwap.price}
                change="up"
                txHash={recentSwap.txHash}
              />
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, i) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-[#00ff88] text-black' 
                    : message.role === 'system'
                      ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                      : 'bg-[#0f0f15] border border-[#00ff88]/20 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="text-xs opacity-60 font-mono">
                      {message.role === 'user' ? 'YOU' : 'MANTLIC'}
                    </span>
                  </div>
                  <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-[#00ff88] font-mono text-sm animate-fade-in">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-[#00ff88]/20 backdrop-blur-xl" style={{ background: 'rgba(10, 10, 15, 0.9)' }}>
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command or ask a question..."
                className="flex-1 bg-[#0f0f15] border border-[#00ff88]/30 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88]/60 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 rounded-xl bg-[#00ff88] text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00cc6a] transition-all flex items-center gap-2 shadow-lg shadow-[#00ff88]/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">SEND</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-600 font-mono">
              Press Enter to send • Type "help" for commands
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}