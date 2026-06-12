'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Terminal, Send, Bot, User, Activity, Cpu, Database, TrendingUp, Loader2, Zap, ChevronRight, X, RefreshCw, ExternalLink, Sparkles, Shield, Zap as ZapIcon, Globe } from 'lucide-react'
import { useAgentMemory } from '../hooks/useAgentMemory'
import { parseCommand } from '../commands/parser'
import { ViralCard } from '../components/ViralCard'

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

// THREE.JS Hero Section with geometric shapes, mouse parallax, and teal palette
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Mobile/low-end detection: use CSS fallback
    const isMobile = window.innerWidth < 768 || 
      /Android|iPhone|iPad/i.test(navigator.userAgent) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
    
    if (isMobile) return // CSS handles the fallback
    
    let animId: number
    let scene: any, camera: any, renderer: any, group: any
    let ico: any, particles: any
    
    let cleanupFn: (() => void) | undefined
    
    const init = async () => {
      try {
        const THREE = await import('three')
        if (!containerRef.current) return
        
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // cap at 1.5 for performance
        containerRef.current.appendChild(renderer.domElement)
        
        // Group for parallax
        group = new THREE.Group()
        scene.add(group)
        
        // Floating icosahedron wireframe (teal)
        const geo = new THREE.IcosahedronGeometry(3, 0)
        const mat = new THREE.MeshBasicMaterial({ 
          color: 0x00d4aa, wireframe: true, transparent: true, opacity: 0.3 
        })
        ico = new THREE.Mesh(geo, mat)
        ico.position.set(0, 0, -5)
        group.add(ico)
        
        // Small floating cubes
        const cubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        const cubeMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 })
        for (let i = 0; i < 20; i++) {
          const cube = new THREE.Mesh(cubeGeo, cubeMat)
          cube.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 5
          )
          cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
          cube.userData.rotSpeed = { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 }
          group.add(cube)
        }
        
        // Teal particle field
        const particleCount = 200
        const pGeo = new THREE.BufferGeometry()
        const pPos = new Float32Array(particleCount * 3)
        const pColors = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
          pPos[i * 3] = (Math.random() - 0.5) * 40
          pPos[i * 3 + 1] = (Math.random() - 0.5) * 30
          pPos[i * 3 + 2] = (Math.random() - 0.5) * 20
          // Mantle teal/cyan palette
          pColors[i * 3] = 0
          pColors[i * 3 + 1] = 0.7 + Math.random() * 0.3
          pColors[i * 3 + 2] = 0.6 + Math.random() * 0.4
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3))
        const pMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.5 })
        particles = new THREE.Points(pGeo, pMat)
        scene.add(particles)
        
        camera.position.z = 15
        
        // Mouse parallax
        const onMouseMove = (e: MouseEvent) => {
          mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
          mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', onMouseMove)
        
        // Animate
        const animate = () => {
          animId = requestAnimationFrame(animate)
          
          // Rotate icosahedron
          if (ico) {
            ico.rotation.x += 0.002
            ico.rotation.y += 0.003
          }
          
          // Rotate cubes
          if (group) {
            group.children.forEach((child: any) => {
              if (child.geometry?.type === 'BoxGeometry') {
                child.rotation.x += child.userData.rotSpeed.x
                child.rotation.y += child.userData.rotSpeed.y
              }
            })
            
            // Subtle parallax (max ±5px)
            group.position.x += (mouseRef.current.x * 2 - group.position.x) * 0.02
            group.position.y += (-mouseRef.current.y * 1.5 - group.position.y) * 0.02
          }
          
          // Rotate particle field slowly
          if (particles) {
            particles.rotation.y += 0.0003
          }
          
          renderer.render(scene, camera)
        }
        animate()
        
        // Resize handler
        const onResize = () => {
          if (!camera || !renderer) return
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)
        
        cleanupFn = () => {
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('resize', onResize)
        }
      } catch (error) {
        console.warn('Three.js initialization failed:', error)
      }
    }
    
    init()
    
    return () => {
      cancelAnimationFrame(animId)
      cleanupFn?.()
      if (containerRef.current && renderer?.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      if (renderer) renderer.dispose()
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose())
            else obj.material.dispose()
          }
        })
      }
    }
  }, [])
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 three-fallback" 
      aria-hidden="true"
    />
  )
}

// Ripple effect hook
function useRipple() {
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const ripple = document.createElement('span')
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add('ripple-effect')
    
    button.appendChild(ripple)
    
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }, [])
  
  return createRipple
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
          <span className="text-gray-500">{'<name>'}</span>
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
  const createRipple = useRipple()
  
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
  
  // GSAP ScrollTrigger for scroll animations
  useEffect(() => {
    let gsap: any, ScrollTrigger: any
    
    const initGSAP = async () => {
      try {
        const gsapModule = await import('gsap')
        gsap = gsapModule.gsap || gsapModule.default
        const scrollTriggerModule = await import('gsap/ScrollTrigger')
        ScrollTrigger = scrollTriggerModule.ScrollTrigger
        
        if (typeof window === 'undefined' || !gsap || !ScrollTrigger) return
        
        gsap.registerPlugin(ScrollTrigger)
        
        // Scroll reveal for .scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach((el) => {
          gsap.fromTo(el, 
            { opacity: 0, y: 30, scale: 0.95 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
          )
        })
        
        // Stagger children
        document.querySelectorAll('.stagger-children').forEach((el) => {
          const children = el.children
          gsap.fromTo(children, 
            { opacity: 0, y: 15 },
            {
              opacity: 1, y: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
          )
        })
        
        // Number counters
        document.querySelectorAll('.counter').forEach((el) => {
          const target = parseInt(el.getAttribute('data-target') || '0')
          gsap.fromTo(el, { innerText: 0 }, {
            innerText: target,
            duration: 1.5,
            ease: 'power2.out',
            snap: { innerText: 1 },
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          })
        })
      } catch (error) {
        console.warn('GSAP not available:', error)
      }
    }
    
    initGSAP()
    
    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach((t: any) => t.kill())
    }
  }, [])
  
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
      <HeroSection />
      
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
                <aside className={`
                  fixed lg:sticky top-16 left-0 z-40 h-screen w-72 flex-shrink-0
                  bg-[#0a0a0f]/95 backdrop-blur-sm border-r border-[#00ff88]/20
                  transform transition-transform duration-300 ease-out
                  ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
                  lg:translate-x-0
                `}>
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-4 lg:hidden flex-shrink-0">
                      <span className="text-xs text-[#00ff88] font-mono font-bold">MENU</span>
                      <button onClick={() => setShowSidebar(false)} className="p-2 rounded hover:bg-[#00ff88]/10">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">

                      {/* Wallet Status */}
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

                      {/* Agent Card */}
                      <AgentCard stats={agentStats} />

                      {/* Viral Card */}
                      {isConnected && <ViralCard />}

                      {/* Command Help */}
                      <CommandHelp />

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={(e) => { createRipple(e); sendMessage('balance'); }}
                          className="w-full py-2 px-3 rounded bg-[#0f0f15] border border-[#00ff88]/20 hover:border-[#00ff88]/50 text-left text-sm font-mono transition-colors flex items-center gap-2 ripple-container btn-glow"
                        >
                          <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                          Check Balance
                        </button>
                        <button
                          onClick={(e) => { createRipple(e); sendMessage('yield'); }}
                          className="w-full py-2 px-3 rounded bg-[#0f0f15] border border-[#00ff88]/20 hover:border-[#00ff88]/50 text-left text-sm font-mono transition-colors flex items-center gap-2 ripple-container btn-glow"
                        >
                          <Activity className="w-4 h-4 text-[#00ff88]" />
                          Compare Yields
                        </button>
                      </div>
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
                <main className="flex-1 flex flex-col min-h-screen lg:pl-72">
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
                onClick={(e) => { createRipple(e); sendMessage(input); }}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 rounded-lg bg-[#00ff88] text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00cc6a] transition-colors flex items-center gap-2 ripple-container btn-glow"
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
          
          {/* Stats Section */}
          <div className="border-t border-[#00ff88]/20 bg-[#0a0a0f] py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-center text-sm font-mono text-[#00ff88] mb-6 scroll-reveal">STATS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 stagger-children">
                {[
                  { value: 37, label: 'POINTS POTENTIAL', suffix: '' },
                  { value: 24, label: 'TESTS PASSING', suffix: '' },
                  { value: 3, label: 'SMART CONTRACTS', suffix: '' },
                  { value: 5000, label: 'MAX TPS', suffix: '+' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4">
                    <div className="text-3xl md:text-4xl font-black text-[#00ff88] font-mono counter" data-target={stat.value}>
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Features Section */}
              <h2 className="text-center text-sm font-mono text-[#00ff88] mb-6 scroll-reveal">FEATURES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <div className="card-hover bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-4 text-center">
                  <Sparkles className="w-8 h-8 text-[#00ff88] mx-auto mb-2" />
                  <h3 className="font-bold text-white text-sm mb-1">AI Commands</h3>
                  <p className="text-xs text-gray-500">Natural language to DeFi actions</p>
                </div>
                <div className="card-hover bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-4 text-center">
                  <Shield className="w-8 h-8 text-[#00ff88] mx-auto mb-2" />
                  <h3 className="font-bold text-white text-sm mb-1">ERC-8004</h3>
                  <p className="text-xs text-gray-500">On-chain agent identity</p>
                </div>
                <div className="card-hover bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-4 text-center">
                  <ZapIcon className="w-8 h-8 text-[#00ff88] mx-auto mb-2" />
                  <h3 className="font-bold text-white text-sm mb-1">1inch Swap</h3>
                  <p className="text-xs text-gray-500">Best price aggregation</p>
                </div>
                <div className="card-hover bg-[#0f0f15] rounded-lg border border-[#00ff88]/20 p-4 text-center">
                  <Globe className="w-8 h-8 text-[#00ff88] mx-auto mb-2" />
                  <h3 className="font-bold text-white text-sm mb-1">Mantle</h3>
                  <p className="text-xs text-gray-500">Fast& cheap L2</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
