'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Terminal, Send, Bot, User, Activity, Cpu, Database, TrendingUp, Loader2, Zap, ChevronRight, X, RefreshCw, ExternalLink } from 'lucide-react'
import { useAgentMemory } from '../hooks/useAgentMemory'
import { parseCommand } from '../commands/parser'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface AgentStats {
  name: string
  reputation: number
  benchmarkDex: number
  benchmarkYield: number
  benchmarkSwap: number
  memoryUsed: number
  totalInteractions: number
}

// THREE.JS Particle Background
function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let animationId: number
    let scene: any, camera: any, renderer: any, particles: any
    
    const initThree = async () => {
      try {
        const THREE = await import('three')
        
        if (!containerRef.current) return
        
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        containerRef.current.appendChild(renderer.domElement)
        
        // Create particles
        const particleCount = 500
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 50
          positions[i * 3 + 1] = (Math.random() - 0.5) * 50
          positions[i * 3 + 2] = (Math.random() - 0.5) * 50
          
          // Green tint for particles
          colors[i * 3] = 0
          colors[i * 3 + 1] = 1
          colors[i * 3 + 2] = 0.53
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        
        const material = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        })
        
        particles = new THREE.Points(geometry, material)
        scene.add(particles)
        
        camera.position.z = 20
        
        // Mouse interaction
        let mouseX = 0, mouseY = 0
        const handleMouseMove = (e: MouseEvent) => {
          mouseX = (e.clientX / window.innerWidth) * 2 - 1
          mouseY = -(e.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener('mousemove', handleMouseMove)
        
        const animate = () => {
          animationId = requestAnimationFrame(animate)
          
          if (particles) {
            particles.rotation.x += 0.0005
            particles.rotation.y += 0.0008
            
            // Mouse interaction
            particles.rotation.x += mouseY * 0.0003
            particles.rotation.y += mouseX * 0.0003
          }
          
          renderer.render(scene, camera)
        }
        animate()
        
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', handleResize)
        
      } catch (error) {
        console.warn('Three.js not available:', error)
      }
    }
    
    initThree()
    
    return () => {
      cancelAnimationFrame(animationId)
      if (containerRef.current && renderer?.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      if (renderer) renderer.dispose()
    }
  }, [])
  
  return <div ref={containerRef} className="fixed inset-0 -z-10" />
}

// Agent Card Component
function AgentCard({ stats }: { stats: AgentStats }) {
  return (
    <div className="bg-[#0f0f15] rounded-lg border border-[#00ff88]/30 p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/50 flex items-center justify-center">
          <Bot className="w-6 h-6 text-[#00ff88]" />
        </div>
        <div>
          <div className="font-bold text-white">{stats.name}</div>
          <div className="flex items-center gap-1 text-xs text-[#00ff88]/60">
            <Activity className="w-3 h-3" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Reputation
          </span>
          <span className="text-[#00ff88] font-mono">{stats.reputation}</span>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-500">BENCHMARKS</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0a0a0f] rounded p-2 text-center">
              <div className="text-lg font-bold text-[#00ff88]">{stats.benchmarkDex}</div>
              <div className="text-[8px] text-gray-500">DEX</div>
            </div>
            <div className="bg-[#0a0a0f] rounded p-2 text-center">
              <div className="text-lg font-bold text-[#00ff88]">{stats.benchmarkYield}</div>
              <div className="text-[8px] text-gray-500">YIELD</div>
            </div>
            <div className="bg-[#0a0a0f] rounded p-2 text-center">
              <div className="text-lg font-bold text-[#00ff88]">{stats.benchmarkSwap}</div>
              <div className="text-[8px] text-gray-500">SWAP</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Database className="w-3 h-3" /> Memory
          </span>
          <span className="text-[#00ff88] font-mono">{stats.memoryUsed}KB</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Interactions</span>
          <span className="text-white font-mono">{stats.totalInteractions}</span>
        </div>
      </div>
    </div>
  )
}

// Chat Message Component
function ChatMessage({ message, index }: { message: Message; index: number }) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user' 
            ? 'bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88]' 
            : message.role === 'system'
              ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm'
              : 'bg-[#0f0f15] border border-[#00ff88]/20 text-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.role === 'user' ? (
            <User className="w-3 h-3" />
          ) : message.role === 'system' ? (
            <Zap className="w-3 h-3" />
          ) : (
            <Bot className="w-3 h-3" />
          )}
          <span className="text-xs opacity-60">
            {message.role === 'user' ? 'YOU' : message.role === 'system' ? 'SYSTEM' : 'MANTLIC'}
          </span>
        </div>
        <div className="font-mono text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}

// Command Help Panel
function CommandHelp() {
  return (
    <div className="bg-[#0f0f15] rounded-lg border border-[#00ff88]/30 p-4">
      <div className="text-xs text-[#00ff88] font-bold mb-3 flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        AVAILABLE COMMANDS
      </div>
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">swap</span>
          <span className="text-gray-500">100 MNT for USDC</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">balance</span>
          <span className="text-gray-500">Show wallet balances</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">yield</span>
          <span className="text-gray-500">Compare DeFi yields</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">register agent</span>
          <span className="text-gray-500">&lt;name&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]">help</span>
          <span className="text-gray-500">Show all commands</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: mntBalance } = useBalance({ address })
  const { memories, remember, recall } = useAgentMemory(address)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `> MANTLIC TERMINAL v1.0
> SYSTEM: OPERATIONAL
> NETWORK: Mantle Mainnet (Chain ID: 5000)

Type "help" for available commands or ask me anything about DeFi on Mantle.`,
      timestamp: Date.now(),
    },
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Agent stats (simulated for demo)
  const [agentStats] = useState<AgentStats>({
    name: 'Mantlic-Agent',
    reputation: 8500,
    benchmarkDex: 8750,
    benchmarkYield: 8200,
    benchmarkSwap: 8900,
    memoryUsed: Math.floor(memories.length * 0.5),
    totalInteractions: memories.length || 127,
  })
  
  // Auto-scroll to bottom
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
    
    // Parse command for memory
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
      
    } catch (error) {
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-black/90 to-transparent border-b border-[#00ff88]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded hover:bg-[#00ff88]/10 transition-colors lg:hidden"
            >
              <Terminal className="w-5 h-5 text-[#00ff88]" />
            </button>
            <div className="w-8 h-8 rounded bg-[#1a1a2e] border border-[#00ff88]/50 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#00ff88]" />
            </div>
            <span className="font-mono font-bold tracking-wider">MANTLIC</span>
            <span className="hidden sm:inline text-xs font-mono text-[#00ff88]/60 ml-2">// AI AGENT TERMINAL</span>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && mntBalance && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="text-[#00ff88]">MNT:</span>
                <span>{parseFloat(mntBalance.formatted).toFixed(4)}</span>
              </div>
            )}
            <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#00ff88]">
              <Activity className="w-3 h-3 animate-pulse" /> ONLINE
            </span>
            <ConnectButton />
          </div>
        </div>
      </nav>
      
      {/* Main Layout */}
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f]/95 backdrop-blur-sm border-r border-[#00ff88]/20 transform transition-transform duration-300 lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 overflow-y-auto h-full">
            {/* Close button for mobile */}
            <button 
              onClick={() => setShowSidebar(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded hover:bg-[#00ff88]/10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            {/* Wallet Status */}
            <div className="mb-4">
              {isConnected ? (
                <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg p-3">
                  <div className="text-xs text-[#00ff88] mb-1">CONNECTED</div>
                  <div className="font-mono text-sm text-white truncate">{address}</div>
                  {mntBalance && (
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="text-[#00ff88]">Balance:</span> {parseFloat(mntBalance.formatted).toFixed(4)} MNT
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#0f0f15] border border-[#00ff88]/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-2">Connect wallet to access DeFi</div>
                  <ConnectButton />
                </div>
              )}
            </div>
            
            {/* Agent Card */}
            <AgentCard stats={agentStats} />
            
            {/* Command Help */}
            <CommandHelp />
            
            {/* Quick Actions */}
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => sendMessage('balance')}
                className="w-full py-2 px-3 rounded bg-[#0f0f15] border border-[#00ff88]/20 hover:border-[#00ff88]/50 text-left text-sm font-mono transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                Check Balance
              </button>
              <button 
                onClick={() => sendMessage('yield')}
                className="w-full py-2 px-3 rounded bg-[#0f0f15] border border-[#00ff88]/20 hover:border-[#00ff88]/50 text-left text-sm font-mono transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-[#00ff88]" />
                Compare Yields
              </button>
            </div>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-[#00ff88]/20 bg-[#0a0a0f]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-mono text-sm text-[#00ff88]">MANTLIC TERMINAL</span>
              <span className="text-xs text-gray-500 ml-2">// AI AGENT</span>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} index={index} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-[#00ff88] font-mono text-sm animate-message">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-[#00ff88]/20 bg-[#0a0a0f]/80">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command or ask a question..."
                className="flex-1 bg-[#0f0f15] border border-[#00ff88]/30 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88]/60 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 rounded-lg bg-[#00ff88] text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00cc6a] transition-colors flex items-center gap-2"
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
      
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-message {
          animation: messageSlideIn 0.3s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        body {
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0a0a0f;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #00ff88/30;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #00ff88/50;
        }
      `}</style>
    </div>
  )
}