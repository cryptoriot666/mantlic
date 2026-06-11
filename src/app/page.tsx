'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Bot, User, Zap, Terminal, ChevronDown, ExternalLink, Shield, Zap as ZapIcon, Globe } from 'lucide-react'
import gsap from 'gsap'
import * as THREE from 'three'

interface Message { role: 'user' | 'assistant'; content: string; status?: 'pending' | 'success' | 'error' }

// Three.js Particle Background
function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    
    // Create particles
    const particleCount = 500
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      // Mantle orange accent with variations
      const orange = Math.random() > 0.7 ? 1 : 0.4 + Math.random() * 0.3
      colors[i * 3] = orange
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.2
      colors[i * 3 + 2] = 0.1 + Math.random() * 0.1
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    
    camera.position.z = 5
    
    // Animation
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      particles.rotation.x += 0.0003
      particles.rotation.y += 0.0005
      
      // Float particles
      const posArray = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001
      }
      particles.geometry.attributes.position.needsUpdate = true
      
      renderer.render(scene, camera)
    }
    animate()
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])
  
  return <div ref={containerRef} className="fixed inset-0 -z-10" />
}

// GSAP Scroll Animations
function useScrollAnimations() {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.3
      })
      
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.6
      })
      
      gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1
      })
      
      // Scroll-triggered animations
      gsap.utils.toArray('.scroll-reveal').forEach((el: any) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      })
      
      // Feature cards stagger
      gsap.utils.toArray('.feature-card').forEach((card: any, i: number) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%'
          }
        })
      })
    }, sectionRef)
    
    return () => ctx.revert()
  }, [])
  
  return sectionRef
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Mantlic v1.0.0 — Terminal for DeFi\n\nType commands in natural language.\n\n\nExamples:\n  > send 0.1 MNT to 0x123...\n  > best yield\n  > balance\n\nType help for all commands.' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sectionRef = useScrollAnimations()
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  
  // Initial GSAP animation on mount
  useEffect(() => {
    gsap.from('.terminal-wrapper', {
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, [])
  
  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    const transferMatch = userMessage.match(/send (\d+\.?\d*) mnt to (0x[a-fA-F0-9]{40})/i)
    if (transferMatch && isConnected) {
      const amount = transferMatch[1], toAddress = transferMatch[2]
      setIsTyping(true)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processing...', status: 'pending' }])
      try {
        sendTransaction({ to: toAddress as `0x${string}`, value: parseEther(amount) })
        setTimeout(() => { setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: `Done. ${amount} MNT moved. You're welcome.`, status: 'success' } : m)) }, 2000)
      } catch { setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: 'Failed.', status: 'error' } : m)) }
      setIsTyping(false)
      return
    }
    
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      if (userMessage.toLowerCase().includes('balance')) {
        const bal = balance ? parseFloat(balance.formatted).toFixed(4) : '0'
        response = `${bal} ${balance?.symbol || 'MNT'}`
      } else if (userMessage.toLowerCase().includes('address')) {
        response = address || 'No wallet'
      } else if (userMessage.toLowerCase().includes('who') || userMessage.toLowerCase().includes('what')) {
        response = 'Mantlic. Terminal for DeFi. No fluff.'
      } else if (userMessage.toLowerCase().includes('help')) {
        response = 'Commands:\n  balance — your MNT balance\n  send <amt> MNT to <addr> — transfer\n  yield — best DeFi yields\n  address — your wallet'
      } else if (userMessage.toLowerCase().includes('yield')) {
        response = 'Top yields on Mantle:\n  • mETH: 4.2% APY\n  • USDY: 5.8% APY\n  • MNT Staking: 3.1% APY'
      } else {
        response = `Command not recognized. Type 'help' for available commands.`
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 800)
  }
  
  return (
    <div ref={sectionRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono font-bold text-lg">Mantlic</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#terminal" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Terminal</a>
            <ConnectButton />
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="hero-title">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Terminal
              </span>
              <br />
              <span className="text-orange-500">for DeFi</span>
            </h1>
          </div>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            One chat. Every protocol. No fluff.
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#terminal"
              className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
            >
              Launch Terminal
              <ZapIcon className="inline-block ml-2 w-5 h-5" />
            </a>
            <a 
              href="#features"
              className="px-8 py-4 border border-white/20 hover:border-white/40 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2"
            >
              Explore Features
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-500" />
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '4', label: 'B+ TVL on Mantle', suffix: '' },
            { number: '50', label: 'ms Avg Transaction', suffix: 'ms' },
            { number: '0.001', label: 'Avg Gas Fee', suffix: 'MNT' },
            { number: '12', label: 'DeFi Protocols', suffix: '+' }
          ].map((stat, i) => (
            <div key={i} className="text-center scroll-reveal">
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                {stat.number}<span className="text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="text-orange-500">Speed</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Terminal-grade interface for the next generation of DeFi on Mantle
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Instant Execution',
                desc: 'Sub-second transaction confirmation with Mantle\'s low-latency infrastructure'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'ERC-8004 Identity',
                desc: 'On-chain agent identity standard. Every decision logged permanently.'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Multi-Protocol',
                desc: 'Access Merchant Moe, Agni Finance, Fluxion and more from one terminal'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="feature-card group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:bg-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Terminal Section */}
      <section id="terminal" className="py-32 px-6 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Command <span className="text-orange-500">Center</span>
            </h2>
            <p className="text-xl text-gray-400">
              Natural language interface for DeFi operations
            </p>
          </div>
          
          <div className="terminal-wrapper rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl shadow-orange-500/10">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-500 font-mono">mantlic — terminal</span>
            </div>
            
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-orange-500" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-2 rounded-xl ${msg.role === 'assistant' ? 'bg-white/5' : 'bg-orange-500 text-white'}`}>
                    <p className="font-mono text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-orange-500/50 transition-colors">
                  <span className="text-orange-500 font-mono">$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a command..."
                    className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-gray-600"
                    disabled={!isConnected}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || !isConnected}
                  className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {!isConnected && (
                <p className="mt-3 text-sm text-gray-500 text-center">Connect wallet to start trading</p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to trade <span className="text-orange-500">Terminal-style</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join the future of DeFi on Mantle. No learning curve. Just commands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#terminal"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Launch Mantlic
            </a>
            <a 
              href="https://explorer.mantle.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/20 hover:border-white/40 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              View on Explorer
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Terminal className="w-3 h-3 text-white" />
            </div>
            <span className="font-mono text-sm text-gray-500">Mantlic v1.0.0</span>
          </div>
          <p className="text-sm text-gray-600">
            Built for Mantle Turing Test Hackathon 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
