'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Bot, User, Zap, Terminal, ChevronDown, ExternalLink, Shield, Globe, Crosshair, Cpu, Activity } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

interface Message { role: 'user' | 'assistant'; content: string; status?: 'pending' | 'success' | 'error' }

function MechaScanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationId: number
    let scanY = 0
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
      
      scanY += 2
      if (scanY > canvas.height) scanY = 0
      
      const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.3)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, scanY - 50, canvas.width, 100)
      
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(canvas.width, scanY)
      ctx.stroke()
      
      for (let x = 0; x < canvas.width; x += 100) { ctx.beginPath(); ctx.arc(x + Math.sin(scanY * 0.01 + x * 0.01) * 20, scanY, 3, 0, Math.PI * 2); ctx.fillStyle = '#00ff88'; ctx.fill() }
      
      animationId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])
  
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-50" />
}

function MechaHead() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(400, 400)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    
    const headGroup = new THREE.Group()
    const headGeo = new THREE.BoxGeometry(2, 2.5, 1.5)
    const headMat = new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 100, specular: 0x444444 })
    headGroup.add(new THREE.Mesh(headGeo, headMat))
    
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    const visor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.1), visorMat)
    visor.position.set(0, 0.3, 0.8)
    headGroup.add(visor)
    
    const antennaMat = new THREE.MeshPhongMaterial({ color: 0x333333 })
    const antennaL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), antennaMat)
    antennaL.position.set(-0.7, 1.5, 0); antennaL.rotation.z = 0.2
    headGroup.add(antennaL)
    const antennaR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), antennaMat)
    antennaR.position.set(0.7, 1.5, 0); antennaR.rotation.z = -0.2
    headGroup.add(antennaR)
    
    const panelMat = new THREE.MeshPhongMaterial({ color: 0x00ff88, transparent: true, opacity: 0.3 })
    const panelL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.8), panelMat)
    panelL.position.set(-1.2, 0, 0); headGroup.add(panelL)
    const panelR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.8), panelMat)
    panelR.position.set(1.2, 0, 0); headGroup.add(panelR)
    
    const vfin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.3), new THREE.MeshPhongMaterial({ color: 0xcc0000 }))
    vfin.position.set(0, 1.3, 0); headGroup.add(vfin)
    
    scene.add(headGroup)
    scene.add(new THREE.AmbientLight(0x404040, 1))
    const light1 = new THREE.PointLight(0x00ff88, 2, 10); light1.position.set(2, 2, 3); scene.add(light1)
    const light2 = new THREE.PointLight(0x0066ff, 1, 10); light2.position.set(-2, -1, 2); scene.add(light2)
    camera.position.z = 5
    
    let animationId: number
    const animate = () => { animationId = requestAnimationFrame(animate); headGroup.rotation.y += 0.005; headGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1; renderer.render(scene, camera) }
    animate()
    return () => { cancelAnimationFrame(animationId); containerRef.current?.removeChild(renderer.domElement); renderer.dispose() }
  }, [])
  
  return <div ref={containerRef} className="w-[400px] h-[400px]" />
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
      gsap.to(button, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 0.3, ease: 'power2.out' })
    }
    const handleLeave = () => gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
    button.addEventListener('mousemove', handleMove)
    button.addEventListener('mouseleave', handleLeave)
    return () => { button.removeEventListener('mousemove', handleMove); button.removeEventListener('mouseleave', handleLeave) }
  }, [])
  return <button ref={buttonRef} onClick={onClick} className={className}>{children}</button>
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction } = useSendTransaction()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'MANTLIC v1.0.0 - MECHA TERMINAL ONLINE\n\n> SYSTEM STATUS: OPERATIONAL\n> NEURAL LINK: ESTABLISHED\n> DEFI PROTOCOLS: LOADED\n\nType commands to interface with Mantle network.' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [scrambleActive, setScrambleActive] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const heroText = useTextScramble('MECHA TERMINAL', scrambleActive)
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    setTimeout(() => setScrambleActive(false), 2000)
    gsap.from('.hero-title', { y: 100, opacity: 0, duration: 1.5, ease: 'power4.out', delay: 0.5 })
    gsap.from('.hero-subtitle', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 1 })
    gsap.from('.hero-cta', { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 1.5 })
    gsap.utils.toArray('.scroll-reveal').forEach((el: any) => gsap.from(el, { y: 80, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }))
    gsap.utils.toArray('.feature-card').forEach((card: any, i: number) => gsap.from(card, { y: 100, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15, scrollTrigger: { trigger: card, start: 'top 90%' } }))
  }, [])
  
  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: '> ' + userMessage }])
    
    const transferMatch = userMessage.match(/send (\d+\.?\d*) mnt to (0x[a-fA-F0-9]{40})/i)
    if (transferMatch && isConnected) {
      const amount = transferMatch[1], toAddress = transferMatch[2]
      setIsTyping(true)
      setMessages(prev => [...prev, { role: 'assistant', content: 'PROCESSING TRANSACTION...\n[...............] 50%', status: 'pending' }])
      try {
        sendTransaction({ to: toAddress as `0x${string}`, value: parseEther(amount) })
        setTimeout(() => setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: 'TRANSACTION COMPLETE\n> ' + amount + ' MNT TRANSFERRED\n> STATUS: SUCCESS', status: 'success' } : m)), 2000)
      } catch { setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: 'TRANSACTION FAILED\n> ERROR CODE: 0xFFFF', status: 'error' } : m)) }
      setIsTyping(false)
      return
    }
    
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      if (userMessage.toLowerCase().includes('balance')) response = 'BALANCE QUERY\n> WALLET: ' + (address?.slice(0,10) || 'none') + '...\n> ' + (balance ? parseFloat(balance.formatted).toFixed(4) : '0') + ' ' + (balance?.symbol || 'MNT') + '\n> STATUS: OK'
      else if (userMessage.toLowerCase().includes('address')) response = 'WALLET ADDRESS\n> ' + (address || 'NO WALLET CONNECTED')
      else if (userMessage.toLowerCase().includes('scan') || userMessage.toLowerCase().includes('status')) response = 'SYSTEM SCAN INITIATED\n> NETWORK: MANTLE MAINNET\n> LATENCY: 47ms\n> TVL: $4.2B\n> GAS: 0.001 MNT\n> PROTOCOLS: 12 ACTIVE\n\nSCAN COMPLETE'
      else if (userMessage.toLowerCase().includes('help')) response = 'AVAILABLE COMMANDS:\n  balance - Query wallet balance\n  scan - Network status report\n  yield - DeFi yield analysis\n  send <amt> MNT to <addr> - Transfer\n  address - Display wallet address'
      else if (userMessage.toLowerCase().includes('yield')) response = 'YIELD ANALYSIS\n> mETH: 4.2% APY\n> USDY: 5.8% APY\n> MNT STAKING: 3.1% APY\n\nRECOMMENDATION: USDY ALLOCATION'
      else response = 'COMMAND NOT RECOGNIZED\n> TYPE help FOR COMMANDS'
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 800)
  }
  
  return (
    <div ref={sectionRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <MechaScanner />
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent border-b border-[#00ff88]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded bg-[#1a1a2e] border border-[#00ff88]/50 flex items-center justify-center"><Terminal className="w-5 h-5 text-[#00ff88]" /></div>
              <div className="absolute inset-0 bg-[#00ff88]/20 blur-lg" />
            </div>
            <div><span className="font-mono font-bold text-lg tracking-wider">MANTLIC</span><div className="text-[10px] text-[#00ff88]/60 font-mono">MECHA TERMINAL v1.0</div></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-mono"><span className="flex items-center gap-2 text-[#00ff88]"><Activity className="w-4 h-4" /> ONLINE</span><span className="text-gray-500">|</span><span className="text-gray-400">MANTLE MAINNET</span></div>
            <ConnectButton />
          </div>
        </div>
      </nav>
      
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:block"><MechaHead /></div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="hero-title">
            <div className="flex items-center justify-center gap-4 mb-8 font-mono text-xs text-[#00ff88]/60">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" /> SYS ONLINE</span>
              <span>|</span><span>MANTLE NETWORK</span><span>|</span><span>v1.0.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 relative">
              <span className="relative inline-block"><span className="bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">{heroText}</span><span className="absolute -inset-1 bg-[#00ff88]/20 blur-xl" /></span>
              <br />
              <span className="text-[#00ff88] relative">FOR DEFI<span className="absolute -inset-1 bg-[#00ff88]/30 blur-lg" /></span>
            </h1>
          </div>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 mb-12 font-mono max-w-2xl mx-auto"><span className="text-[#00ff88]">{">"}</span> NEURAL INTERFACE FOR THE NEXT GEN OF DEFI<br /><span className="text-gray-600">// ONE COMMAND. EVERY PROTOCOL. NO FLUFF.</span></p>
          <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center">
            <MagnetButton onClick={() => document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' })} className="group relative px-10 py-5 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold text-lg tracking-wider rounded-lg overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-3"><Crosshair className="w-5 h-5" /> INITIALIZE</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00cc6a] to-[#00ff88] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </MagnetButton>
            <MagnetButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 border-2 border-[#00ff88]/50 hover:border-[#00ff88] text-[#00ff88] font-bold text-lg tracking-wider rounded-lg transition-all duration-300 hover:bg-[#00ff88]/10">
              <span className="flex items-center justify-center gap-3"><Cpu className="w-5 h-5" /> SYSTEMS</span>
            </MagnetButton>
          </div>
        </div>
        <div className="absolute top-20 left-6 w-20 h-20 border-l-2 border-t-2 border-[#00ff88]/30" />
        <div className="absolute top-20 right-6 w-20 h-20 border-r-2 border-t-2 border-[#00ff88]/30" />
        <div className="absolute bottom-6 left-6 w-20 h-20 border-l-2 border-b-2 border-[#00ff88]/30" />
        <div className="absolute bottom-6 right-6 w-20 h-20 border-r-2 border-b-2 border-[#00ff88]/30" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"><span className="text-[10px] font-mono text-[#00ff88]/50 tracking-widest">SCROLL</span><ChevronDown className="w-6 h-6 text-[#00ff88]/50 animate-bounce" /></div>
      </section>
      
      <section className="py-20 px-6 border-y border-[#00ff88]/20 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><span className="text-xs font-mono text-[#00ff88]/60 tracking-widest">// SYSTEM METRICS</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ number: '4.2', label: 'BILLION TVL', prefix: '$' }, { number: '47', label: 'MS LATENCY', prefix: '' }, { number: '0.001', label: 'AVG GAS FEE', prefix: '' }, { number: '12', label: 'PROTOCOLS', prefix: '' }].map((stat, i) => (
              <div key={i} className="text-center scroll-reveal"><div className="text-4xl md:text-5xl font-black text-[#00ff88] mb-2 tracking-tight">{stat.prefix}{stat.number}</div><div className="text-xs font-mono text-gray-500 tracking-widest">{stat.label}</div></div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-reveal"><span className="text-xs font-mono text-[#00ff88]/60 tracking-widest">// CORE SYSTEMS</span><h2 className="text-4xl md:text-6xl font-black mt-4 mb-6 tracking-tight">MECHA <span className="text-[#00ff88]">CAPABILITIES</span></h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{ icon: <Zap className="w-8 h-8" />, title: 'INSTANT EXECUTION', code: 'SYS-001', desc: "Sub-second transaction confirmation. Mantle's low-latency infrastructure handles 1000+ TPS." }, { icon: <Shield className="w-8 h-8" />, title: 'ERC-8004 IDENTITY', code: 'SYS-002', desc: 'On-chain agent identity standard. Every decision logged permanently on Mantle.' }, { icon: <Globe className="w-8 h-8" />, title: 'MULTI-PROTOCOL', code: 'SYS-003', desc: 'Access Merchant Moe, Agni Finance, Fluxion and more from one terminal interface.' }].map((feature, i) => (
              <div key={i} className="feature-card group relative p-8 rounded-lg bg-[#0a0a0f] border border-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-[#00ff88]/30" /><div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[#00ff88]/30" /><div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-[#00ff88]/30" /><div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-[#00ff88]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10"><div className="flex items-center justify-between mb-6"><div className="w-16 h-16 rounded bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition-all duration-300">{feature.icon}</div><span className="text-xs font-mono text-[#00ff88]/40">{feature.code}</span></div><h3 className="text-xl font-bold mb-3 tracking-wider">{feature.title}</h3><p className="text-gray-500 font-mono text-sm leading-relaxed">{feature.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="terminal" className="py-32 px-6 bg-gradient-to-b from-transparent via-[#00ff88]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 scroll-reveal"><span className="text-xs font-mono text-[#00ff88]/60 tracking-widest">// COMMAND INTERFACE</span><h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight">MECHA <span className="text-[#00ff88]">CONSOLE</span></h2></div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[#00ff88]/30 overflow-hidden shadow-2xl shadow-[#00ff88]/10">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f15] border-b border-[#00ff88]/20">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
              <span className="text-xs font-mono text-[#00ff88]/60">MANTLIC TERMINAL v1.0</span>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00ff88]/40"><span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />ONLINE</div>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#050508]">
              {messages.map((msg, i) => (
                <div key={i} className={'flex gap-3 ' + (msg.role === 'user' ? 'justify-end' : '')}>
                  {msg.role === 'assistant' && <div className="w-10 h-10 rounded bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-[#00ff88]" /></div>}
                  <div className={'max-w-[85%] px-4 py-3 rounded font-mono text-sm whitespace-pre-wrap ' + (msg.role === 'assistant' ? 'bg-[#0f0f15] border border-[#00ff88]/20 text-[#00ff88]/90' : 'bg-[#00ff88] text-black')}>{msg.content}</div>
                  {msg.role === 'user' && <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5" /></div>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-[#0f0f15] border-t border-[#00ff88]/20">
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded bg-[#050508] border border-[#00ff88]/30 focus-within:border-[#00ff88] transition-colors">
                  <span className="text-[#00ff88] font-mono">$</span>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Enter command..." className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-gray-600" disabled={!isConnected} />
                </div>
                <button onClick={handleSend} disabled={!input.trim() || isTyping || !isConnected} className="px-6 py-3 rounded bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send className="w-5 h-5" /></button>
              </div>
              {!isConnected && <p className="mt-3 text-sm text-center font-mono text-[#00ff88]/60">// CONNECT WALLET TO ACCESS TERMINAL</p>}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <span className="text-xs font-mono text-[#00ff88]/60 tracking-widest">// DEPLOYMENT</span>
          <h2 className="text-4xl md:text-6xl font-black mt-4 mb-8 tracking-tight">READY TO <span className="text-[#00ff88]">INITIALIZE</span>?</h2>
          <p className="text-xl text-gray-500 mb-12 font-mono">// JOIN THE NEXT WAVE OF MECHANIZED DEFI</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <MagnetButton onClick={() => document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold text-lg tracking-wider rounded-lg">LAUNCH MECHA</MagnetButton>
            <a href="https://explorer.mantle.xyz" target="_blank" rel="noopener noreferrer" className="px-10 py-5 border-2 border-[#00ff88]/50 hover:border-[#00ff88] text-[#00ff88] font-bold text-lg tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-3">EXPLORER<ExternalLink className="w-5 h-5" /></a>
          </div>
        </div>
      </section>
      
      <footer className="py-8 px-6 border-t border-[#00ff88]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center"><Terminal className="w-3 h-3 text-[#00ff88]" /></div><span className="font-mono text-sm text-gray-500">MANTLIC v1.0.0</span></div>
          <p className="text-sm font-mono text-gray-600">// MANTLE TURING TEST HACKATHON 2026</p>
        </div>
      </footer>
    </div>
  )
}
