'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Bot, User, Terminal, ChevronDown, ExternalLink, Crosshair, Cpu, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMantlicAgent, type AgentMessage } from '../agents/brain'
import { getTokenPrice } from '../lib/dex'

gsap.registerPlugin(ScrollTrigger)

// SVG Mecha Head
function MechaHeadSVG() {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00ff88"/><stop offset="50%" stopColor="#00ffaa"/><stop offset="100%" stopColor="#00ff88"/></linearGradient>
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a2a3e"/><stop offset="50%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0a0a1e"/></linearGradient>
        </defs>
        <rect x="50" y="40" width="100" height="120" rx="5" fill="url(#metalGrad)" stroke="#00ff88" strokeWidth="1"/>
        <line x1="50" y1="80" x2="150" y2="80" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
        <line x1="50" y1="120" x2="150" y2="120" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
        <rect x="60" y="70" width="80" height="25" rx="3" fill="url(#visorGrad)" filter="url(#glow)" className="animate-pulse"/>
        <polygon points="100,25 90,45 110,45" fill="#cc0000" stroke="#ff0000" strokeWidth="1"/>
        <line x1="45" y1="50" x2="30" y2="20" stroke="#333" strokeWidth="3"/>
        <circle cx="30" cy="18" r="4" fill="#00ff88" filter="url(#glow)" className="animate-ping"/>
        <line x1="155" y1="50" x2="170" y2="20" stroke="#333" strokeWidth="3"/>
        <circle cx="170" cy="18" r="4" fill="#00ff88" filter="url(#glow)" className="animate-ping"/>
        <rect x="35" y="70" width="12" height="60" fill="#00ff88" opacity="0.2"/>
        <rect x="153" y="70" width="12" height="60" fill="#00ff88" opacity="0.2"/>
        <rect x="70" y="145" width="60" height="8" rx="2" fill="#0a0a1e" stroke="#00ff88" strokeWidth="0.5"/>
        <circle cx="85" cy="149" r="2" fill="#00ff88" className="animate-pulse"/>
        <circle cx="100" cy="149" r="2" fill="#00ff88" className="animate-pulse"/>
        <circle cx="115" cy="149" r="2" fill="#00ff88" className="animate-pulse"/>
      </svg>
      <div className="absolute -top-4 -left-4 w-2 h-2 rounded-full bg-[#00ff88] animate-ping"/>
      <div className="absolute -top-2 -right-6 w-1 h-1 rounded-full bg-[#00ff88] animate-ping" style={{animationDelay: '0.5s'}}/>
      <div className="absolute -bottom-4 -left-2 w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" style={{animationDelay: '1s'}}/>
      <div className="absolute -bottom-2 -right-4 w-2 h-2 rounded-full bg-[#00ff88] animate-ping" style={{animationDelay: '1.5s'}}/>
    </div>
  )
}

function GlitchText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      <span className="glitch-1 absolute inset-0 text-[#ff0000] opacity-50">{children}</span>
      <span className="glitch-2 absolute inset-0 text-[#00ff88] opacity-50">{children}</span>
      {children}
      <style jsx>{`.glitch-1{clip-path:inset(20% 0 60% 0);transform:translate(-2px,0);animation:glitch1 2s infinite}.glitch-2{clip-path:inset(60% 0 20% 0);transform:translate(2px,0);animation:glitch2 2s infinite}@keyframes glitch1{0%,100%{transform:translate(-2px,0)}25%{transform:translate(2px,0)}}@keyframes glitch2{0%,100%{transform:translate(2px,0)}50%{transform:translate(-2px,0)}}`}</style>
    </span>
  )
}

function AnimatedGrid() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#00ff881px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)', backgroundSize: '50px 50px', animation: 'gridMove 20s linear infinite'}}/>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f] opacity-80"/>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff88]/5 blur-[100px] rounded-full"/>
    </div>
  )
}

function useTextScramble(text: string, active: boolean) {
  const [displayText, setDisplayText] = useState(text)
  useEffect(() => {
    if (!active) { setDisplayText(text); return }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
    let frame = 0
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((c, i) => i < frame ? text[i] : chars[Math.floor(Math.random() * chars.length)]).join(''))
      frame++
      if (frame > 20) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [text, active])
  return displayText
}

function MagnetButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return
    const handleMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      gsap.to(button, { x: (e.clientX - rect.left - rect.width / 2) * 0.2, y: (e.clientY - rect.top - rect.height / 2) * 0.2, duration: 0.3, ease: 'power2.out' })
    }
    const handleLeave = () => gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
    button.addEventListener('mousemove', handleMove)
    button.addEventListener('mouseleave', handleLeave)
    return () => { button.removeEventListener('mousemove', handleMove); button.removeEventListener('mouseleave', handleLeave) }
  }, [])
  return <button ref={buttonRef} onClick={onClick} className={className}>{children}</button>
}

function StatusIcon({ status }: { status?: string }) {
  if (status === 'pending') return <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
  if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />
  return null
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [input, setInput] = useState('')
  const [mntPrice, setMntPrice] = useState<number>(0.95)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrambleActive, setScrambleActive] = useState(true)
  const [messages, setMessages] = useState<AgentMessage[]>([{
    id: '1', role: 'agent', content: 'MANTLIC AGENT v1.0 ONLINE\n\n> SYSTEM: OPERATIONAL\n> WALLET: ' + (address ? address.slice(0,10) + '...' : 'NOT CONNECTED') + '\n> MNT PRICE: $' + mntPrice + '\n> NETWORK: Mantle Sepolia\n\nReady for commands. Type "help" for available actions.', timestamp: Date.now()
  }])
  const [isProcessing, setIsProcessing] = useState(false)
  const heroText = useTextScramble('MECHA AGENT', scrambleActive)
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { setTimeout(() => setScrambleActive(false), 2000) }, [])
  useEffect(() => {
    gsap.from('.hero-title', { y: 100, opacity: 0, duration: 1.5, ease: 'power4.out', delay: 0.5 })
    gsap.from('.hero-subtitle', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 1 })
    gsap.from('.hero-cta', { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 1.5 })
    gsap.utils.toArray('.scroll-reveal').forEach((el: any) => gsap.from(el, { y: 80, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }))
    gsap.utils.toArray('.feature-card').forEach((card: any, i: number) => gsap.from(card, { y: 100, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15, scrollTrigger: { trigger: card, start: 'top 90%' } }))
  }, [])
 useEffect(() => { getTokenPrice('MNT').then(p => setMntPrice(p)) }, [])
  
  const processInput = async () => {
    if (!input.trim() || isProcessing) return
    const userMessage = input.trim()
    setInput('')
    setIsProcessing(true)
    
    const userMsg: AgentMessage = { id: crypto.randomUUID(), role: 'user', content: userMessage, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    
    // Import and run parser
    const { parseCommand, getHelpText } = await import('../commands/parser')
    const { getSwapQuote, getTokenPrice: getPrice } = await import('../lib/dex')
    
    const parsed = parseCommand(userMessage)
    let response = ''
    
    switch (parsed.type) {
      case 'swap': {
        const params = parsed.params as any
        if (params.condition) {
          response = 'MONITOR SET\n\n> TOKEN: ' + params.condition.token + '\n> CONDITION: ' + params.condition.type.replace('_', ' ').toUpperCase() + ' $' + params.condition.price + '\n> ACTION: Swap ' + params.amountIn + ' ' + params.tokenIn + ' → ' + params.tokenOut + '\n\nMonitor active. Will execute when condition met.'
        } else {
          const quote = await getSwapQuote(params.tokenIn, params.tokenOut, params.amountIn)
          if (quote) {
            response = 'SWAP QUOTE\n\n> ' + params.amountIn + ' ' + params.tokenIn + ' → ' + quote.expectedOutput + ' ' + params.tokenOut + '\n> ROUTE: ' + quote.route + '\n> PRICE IMPACT: ' + quote.priceImpact + '%\n> SLIPPAGE: ' + (params.slippage / 100) + '%\n\n[Demo Mode - Sepolia Read Only]'
          } else {
            response = 'INVALID PAIR: ' + params.tokenIn + '/' + params.tokenOut + ' not supported'
          }
        }
        break
      }
      case 'balance': {
        const bal = balance ? parseFloat(balance.formatted).toFixed(4) : '0'
        response = 'BALANCE QUERY\n\n> MNT: ' + bal + '\n> WETH: --\n> USDC: --\n\nConnect wallet for full balance'
        break
      }
      case 'yield': {
        response = 'YIELD OPPORTUNITIES\n\nPROTOCOL        APY     TVL\n--- ---     ---\nAgni Finance  5.8%    $30M\nUSDY (Ondo)    5.2%    $100M\nMerchant Moe   4.2%    $50M\nmETH         4.0%    $80M\n\nTOP PICK: Agni Finance (5.8% APY)'
        break
      }
      case 'status': {
        const price = await getPrice('MNT')
        response = 'SYSTEM STATUS\n\n> NETWORK: Mantle Sepolia\n> STATUS: ONLINE\n> MNT PRICE: $' + price + '\n> GAS: 0.001 MNT\n> TVL: $4.2B\n> WALLET: ' + (address?.slice(0,10) || 'none') + '...'
        break
      }
      case 'help': {
        response = getHelpText()
        break
      }
      default: {
        response = 'UNKNOWN COMMAND: "' + parsed.raw + '"\n\nType "help" for available commands.'
 }
    }
    
    const agentMsg: AgentMessage = { id: crypto.randomUUID(), role: 'agent', content: response, timestamp: Date.now() }
    setMessages(prev => [...prev, agentMsg])
    setIsProcessing(false)
  }
  
  return (
    <div ref={sectionRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <AnimatedGrid />
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent border-b border-[#00ff88]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1a1a2e] border border-[#00ff88]/50 flex items-center justify-center"><Terminal className="w-4 h-4 text-[#00ff88]" /></div>
            <span className="font-mono font-bold tracking-wider">MANTLIC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#00ff88]"><Activity className="w-3 h-3" /> ONLINE</span>
            <ConnectButton />
          </div>
        </div>
      </nav>
      
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="mb-6 md:mb-8"><MechaHeadSVG /></div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="hero-title">
            <div className="flex items-center justify-center gap-3 mb-4 md:mb-6 font-mono text-[10px] md:text-xs text-[#00ff88]/60">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> SYS ONLINE</span>
              <span>|</span><span>MANTLE</span><span>|</span><span>MNT ${mntPrice}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-6">
              <GlitchText className="block"><span className="bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">{heroText}</span></GlitchText>
              <span className="text-[#00ff88] block mt-2">FOR DEFI</span>
            </h1>
          </div>
          <p className="hero-subtitle text-sm md:text-xl text-gray-400 mb-8 md:mb-12 font-mono max-w-2xl mx-auto">
            <span className="text-[#00ff88]">{">"}</span> AUTONOMOUS TRADING AGENT
            <br />
            <span className="text-gray-600 text-xs md:text-sm">// SWAP. MONITOR. EXECUTE.</span>
</p>
          <div className="hero-cta flex flex-col sm:flex-row gap-3 md:gap-6 justify-center">
            <MagnetButton onClick={() => document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold text-sm md:text-lg tracking-wider rounded-lg">
              <span className="flex items-center justify-center gap-2"><Crosshair className="w-4 h-4" /> LAUNCH AGENT</span>
            </MagnetButton>
            <MagnetButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 md:px-10 py-3 md:py-4 border-2 border-[#00ff88]/50 hover:border-[#00ff88] text-[#00ff88] font-bold text-sm md:text-lg tracking-wider rounded-lg transition-all">
              <span className="flex items-center justify-center gap-2"><Cpu className="w-4 h-4" /> CAPABILITIES</span>
            </MagnetButton>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[8px] font-mono text-[#00ff88]/50 tracking-widest">SCROLL</span>
          <ChevronDown className="w-5 h-5 text-[#00ff88]/50 animate-bounce" />
        </div>
      </section>
      
      <section className="py-12 md:py-20 px-4 border-y border-[#00ff88]/20 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8"><span className="text-[10px] font-mono text-[#00ff88]/60 tracking-widest">// COMMAND EXAMPLES</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { cmd: 'swap 100 MNT for USDC', desc: 'Execute swap instantly' },
              { cmd: 'swap MNT for USDC when MNT < $0.90', desc: 'Conditional auto-swap' },
              { cmd: 'yield', desc: 'Compare DeFi yields' }
            ].map((ex, i) => (
              <div key={i} className="p-4 rounded bg-[#0a0a0f] border border-[#00ff88]/20 font-mono text-sm">
                <div className="text-[#00ff88] mb-1">$ {ex.cmd}</div>
                <div className="text-gray-500 text-xs">{ex.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="features" className="py-16 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 scroll-reveal"><span className="text-[10px] font-mono text-[#00ff88]/60 tracking-widest">// AGENT CAPABILITIES</span><h2 className="text-3xl md:text-5xl font-black mt-4 mb-6">MECHA <span className="text-[#00ff88]">FEATURES</span></h2></div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: <Crosshair className="w-6 h-6 md:w-8 md:h-8" />, title: 'INSTANT SWAP', code: 'CMD-001', desc: 'Swap tokens with natural language. No complex UI.' },
              { icon: <Activity className="w-6 h-6 md:w-8 md:h-8" />, title: 'PRICE MONITOR', code: 'CMD-002', desc: 'Watch prices and execute when conditions met.' },
              { icon: <Terminal className="w-6 h-6 md:w-8 md:h-8" />, title: 'YIELD HUNT', code: 'CMD-003', desc: 'Compare yields across all Mantle protocols.' }
            ].map((feature, i) => (
              <div key={i} className="feature-card group relative p-4 md:p-8 rounded-lg bg-[#0a0a0f] border border-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[#00ff88]/30" /><div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-[#00ff88]/30" /><div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-[#00ff88]/30" /><div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-[#00ff88]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 md:w-16 md:h-16 rounded bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition-all duration-300">{feature.icon}</div><span className="text-[10px] font-mono text-[#00ff88]/40">{feature.code}</span></div><h3 className="text-base md:text-xl font-bold mb-2 tracking-wider">{feature.title}</h3><p className="text-gray-500 font-mono text-xs md:text-sm">{feature.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="terminal" className="py-16 md:py-32 px-4 bg-gradient-to-b from-transparent via-[#00ff88]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12 scroll-reveal"><span className="text-[10px] font-mono text-[#00ff88]/60 tracking-widest">// AGENT INTERFACE</span><h2 className="text-3xl md:text-5xl font-black mt-4">MECHA <span className="text-[#00ff88]">CONSOLE</span></h2></div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[#00ff88]/30 overflow-hidden shadow-2xl shadow-[#00ff88]/10">
            <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-[#0f0f15] border-b border-[#00ff88]/20">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
              <span className="text-[10px] font-mono text-[#00ff88]/60 hidden sm:inline">MANTLIC AGENT v1.0</span>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#00ff88]/40"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />ONLINE</div>
            </div>
            <div className="h-80 md:h-96 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#050508]">
              {messages.map((msg) => (
                <div key={msg.id} className={'flex gap-2 ' + (msg.role === 'user' ? 'justify-end' : '')}>
                  {msg.role === 'agent' && <div className="w-8 h-8 rounded bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-[#00ff88]" /></div>}
                  <div className={'max-w-[85%] px-3 py-2 rounded font-mono text-xs md:text-sm whitespace-pre-wrap ' + (msg.role === 'agent' ? 'bg-[#0f0f15] border border-[#00ff88]/20 text-[#00ff88]/90' : 'bg-[#00ff88] text-black')}>
                    {msg.content}
                    {msg.status && <StatusIcon status={msg.status} />}
                  </div>
                  {msg.role === 'user' && <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4" /></div>}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-[#00ff88] animate-pulse" /></div>
                  <div className="px-3 py-2 rounded bg-[#0f0f15] border border-[#00ff88]/20 font-mono text-xs text-[#00ff88]/60">PROCESSING...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 md:p-4 bg-[#0f0f15] border-t border-[#00ff88]/20">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded bg-[#050508] border border-[#00ff88]/30 focus-within:border-[#00ff88] transition-colors">
                  <span className="text-[#00ff88] font-mono text-sm">$</span>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && processInput()} placeholder="Enter command..." className="flex-1 bg-transparent font-mono text-xs md:text-sm outline-none placeholder:text-gray-600" disabled={!isConnected} />
                </div>
                <button onClick={processInput} disabled={!input.trim() || isProcessing || !isConnected} className="px-4 py-2 rounded bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
              {!isConnected && <p className="mt-2 text-xs text-center font-mono text-[#00ff88]/60">// CONNECT WALLET TO ACTIVATE AGENT</p>}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <span className="text-[10px] font-mono text-[#00ff88]/60 tracking-widest">// DEPLOYMENT</span>
          <h2 className="text-3xl md:text-5xl font-black mt-4 mb-6">READY TO <span className="text-[#00ff88]">ACTIVATE</span>?</h2>
          <p className="text-sm md:text-xl text-gray-500 mb-8 md:mb-12 font-mono">// AUTONOMOUS DEFI AGENT</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center">
            <MagnetButton onClick={() => document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold text-sm md:text-lg tracking-wider rounded-lg">LAUNCH AGENT</MagnetButton>
            <a href="https://explorer.mantle.xyz" target="_blank" rel="noopener noreferrer" className="px-6 md:px-10 py-3 md:py-4 border-2 border-[#00ff88]/50 hover:border-[#00ff88] text-[#00ff88] font-bold text-sm md:text-lg tracking-wider rounded-lg transition-all flex items-center justify-center gap-2">EXPLORER<ExternalLink className="w-4 h-4" /></a>
          </div>
        </div>
      </section>
      
      <footer className="py-6 px-4 border-t border-[#00ff88]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center"><Terminal className="w-2.5 h-2.5 text-[#00ff88]" /></div><span className="font-mono text-xs text-gray-500">MANTLIC v1.0.0</span></div>
          <p className="text-[10px] font-mono text-gray-600">// MANTLE TURING TEST HACKATHON 2026</p>
        </div>
      </footer>
      <style jsx global>{`@keyframes gridMove { from { background-position: 0 0; } to { background-position: 50px 50px; } }`}</style>
    </div>
  )
}
