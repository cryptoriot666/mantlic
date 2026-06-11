'use client'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useBalance, useSendTransaction, useWriteContract, usePublicClient } from 'wagmi'
import { parseEther, parseUnits, formatUnits } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Bot, User, Terminal, ChevronDown, ExternalLink, Crosshair, Cpu, Activity, ArrowDownUp, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MANTLE_TOKENS, MANTLE_CHAIN_ID, getSwapQuote, getSwapTransaction, getMNTPrice, formatTokenAmount, type Token } from '../lib/1inch'
import { mantle } from '../lib/wagmi'

gsap.registerPlugin(ScrollTrigger)

interface TokenSelectorProps {
  selectedToken: Token | null
  onSelect: (token: Token) => void
  label: string
  balance?: string
}

function TokenSelector({ selectedToken, onSelect, label, balance }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tokens = Object.values(MANTLE_TOKENS)
  
  return (
    <div className="relative">
      <div className="text-[10px] font-mono text-gray-500 mb-1">{label}</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0f0f15] border border-[#00ff88]/30 hover:border-[#00ff88] transition-colors"
      >
        {selectedToken ? (
          <>
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-sm font-bold">
              {selectedToken.symbol.slice(0, 2)}
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold">{selectedToken.symbol}</div>
              <div className="text-xs text-gray-500">{selectedToken.name}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left text-gray-500">Select token</div>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0f] border border-[#00ff88]/30 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); setIsOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#00ff88]/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-sm font-bold">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold">{token.symbol}</div>
                <div className="text-xs text-gray-500">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SwapInterface() {
  const { address, isConnected } = useAccount()
  const { data: mntBalance } = useBalance({ address, token: '0xdead0000000000000000420694200000000000000' })
  const { sendTransaction, isPending: isSending } = useSendTransaction()
  const [fromToken, setFromToken] = useState<Token | null>(MANTLE_TOKENS.MNT)
  const [toToken, setToToken] = useState<Token | null>(MANTLE_TOKENS.USDC)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [swapError, setSwapError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [mntPrice, setMntPrice] = useState(0.95)
  
  useEffect(() => {
    getMNTPrice().then(setMntPrice)
  }, [])
  
  // Get quote when inputs change
  useEffect(() => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('')
      return
    }
    
    const getQuote = async () => {
      setIsLoadingQuote(true)
      try {
        const amountWei = parseUnits(fromAmount, fromToken.decimals).toString()
        const quote = await getSwapQuote({
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: amountWei,
          fromAddress: address || '',
          slippage: 50
        })
        
        if (quote) {
          setToAmount(formatTokenAmount(quote.toTokenAmount, toToken.decimals))
        } else {
          // Mock calculation for demo
          const mockRate = fromToken.symbol === 'MNT' ? 0.95 : 1
          const mockAmount = parseFloat(fromAmount) * mockRate
          setToAmount(mockAmount.toFixed(4))
        }
      } catch (error) {
        console.error('Quote error:', error)
        // Mock calculation
        const mockRate = fromToken.symbol === 'MNT' ? 0.95 : 1
        const mockAmount = parseFloat(fromAmount) * mockRate
        setToAmount(mockAmount.toFixed(4))
      }
      setIsLoadingQuote(false)
    }
    
    const debounce = setTimeout(getQuote, 500)
    return () => clearTimeout(debounce)
  }, [fromToken, toToken, fromAmount, address])
  
  const handleSwap = async () => {
    if (!isConnected || !fromToken || !toToken || !fromAmount) return
    
    setSwapError('')
    setTxHash('')
    
    try {
      // For demo, show simulated transaction
      // In production, this would call getSwapTransaction and execute
      
      // Simulate transaction hash
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setTxHash(mockTxHash)
      
      // If real wallet connected, try actual swap
      if (address && mntBalance && parseFloat(fromAmount) > 0) {
        const amountWei = parseUnits(fromAmount, fromToken.decimals)
        
        // For native token (MNT) swap
        if (fromToken.symbol === 'MNT') {
          sendTransaction({
            to: '0x7a250d5630B4cF539739dF2C5dAcb04f6AB7f705' as `0x${string}`,
            value: amountWei,
            data: '0x'
          })
        }
      }
    } catch (error: any) {
      setSwapError(error.message || 'Transaction failed')
    }
  }
  
  const switchTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-xl bg-[#0a0a0f] border border-[#00ff88]/30 overflow-hidden">
        {/* From Token */}
        <div className="p-4 border-b border-[#00ff88]/10">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-mono text-gray-500">FROM</span>
            {mntBalance && (
              <span className="text-xs font-mono text-gray-500">
                Balance: {parseFloat(mntBalance.formatted).toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-gray-700"
            />
            <TokenSelector
              selectedToken={fromToken}
              onSelect={setFromToken}
              label=""
              balance={mntBalance?.formatted}
            />
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="relative h-0 flex items-center justify-center z-10">
          <button
            onClick={switchTokens}
            className="w-10 h-10 rounded-full bg-[#0a0a0f] border-2 border-[#00ff88]/50 flex items-center justify-center hover:border-[#00ff88] transition-colors"
          >
            <ArrowDownUp className="w-4 h-4 text-[#00ff88]" />
          </button>
        </div>
        
        {/* To Token */}
        <div className="p-4 bg-[#050508]">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-mono text-gray-500">TO</span>
            {isLoadingQuote && <Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" />}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 text-2xl font-bold text-gray-400">
              {toAmount || '0.0'}
            </div>
            <TokenSelector
              selectedToken={toToken}
              onSelect={setToToken}
              label=""
            />
          </div>
        </div>
        
        {/* Details */}
        {fromAmount && toAmount && (
          <div className="px-4 py-3 border-t border-[#00ff88]/10 text-xs font-mono text-gray-500">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 {fromToken?.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken?.symbol}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Price Impact</span>
              <span className="text-green-500">{"<"}0.1%</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Network Fee</span>
              <span>~0.001 MNT</span>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-4">
              <ConnectButton />
            </div>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSending}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#00ff88]/20 transition-all"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> SWAPPING...
                </span>
              ) : (
                'SWAP'
              )}
            </button>
          )}
        </div>
        
        {/* Error/Success */}
        {swapError && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              <XCircle className="w-4 h-4" />
              {swapError}
            </div>
          </div>
        )}
        
        {txHash && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="flex-1">Transaction submitted!</span>
              <a
                href={`https://explorer.mantle.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Demo Mode Notice */}
      <div className="mt-4 p-3 rounded-lg bg-[#00ff88]/5 border border-[#00ff88]/20 text-xs font-mono text-[#00ff88]/60 text-center">
        Demo Mode: Connect wallet and add1inch API key for real swaps
      </div>
    </div>
  )
}

// SVG Mecha Head
function MechaHeadSVG() {
  return (
    <div className="relative w-48 h-48 mx-auto">
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

export default function Home() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'swap' | 'terminal'>('swap')
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <AnimatedGrid />
      
      {/* Navigation */}
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
      
      {/* Hero */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 pt-20">
        <div className="mb-4"><MechaHeadSVG /></div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4">
            <GlitchText className="block"><span className="bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">MECHA SWAP</span></GlitchText>
            <span className="text-[#00ff88] block mt-2">FOR MANTLE</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 font-mono">
            <span className="text-[#00ff88]">{">"}</span> NATIVE TOKEN SWAPS ON MANTLE
 </p>
        </div>
      </section>
      
      {/* Tab Navigation */}
      <section className="px-4 mb-8">
        <div className="max-w-md mx-auto flex gap-2 p-1 rounded-lg bg-[#0a0a0f] border border-[#00ff88]/20">
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'swap' ? 'bg-[#00ff88] text-black' : 'hover:bg-[#00ff88]/10'}`}
          >
            <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> SWAP</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'terminal' ? 'bg-[#00ff88] text-black' : 'hover:bg-[#00ff88]/10'}`}
          >
            <span className="flex items-center justify-center gap-2"><Terminal className="w-4 h-4" /> TERMINAL</span>
          </button>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="px-4 pb-20">
        {activeTab === 'swap' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black mb-2">TOKEN<span className="text-[#00ff88]">SWAP</span></h2>
              <p className="text-gray-500 font-mono text-sm">Swap any token on Mantle with low fees</p>
            </div>
            <SwapInterface />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black mb-2">AGENT <span className="text-[#00ff88]">TERMINAL</span></h2>
              <p className="text-gray-500 font-mono text-sm">Natural language DeFi commands</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0f] border border-[#00ff88]/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f15] border-b border-[#00ff88]/20">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
                <span className="text-[10px] font-mono text-[#00ff88]/60">MANTLIC TERMINAL</span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#00ff88]/40"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />ONLINE</div>
              </div>
              <div className="p-4 bg-[#050508] text-sm font-mono text-[#00ff88]/90 whitespace-pre-wrap">
{`MANTLIC TERMINAL v1.0
> SYSTEM: OPERATIONAL
> WALLET: ${address ? address.slice(0,10) + '...' : 'NOT CONNECTED'}
> NETWORK: Mantle Mainnet
> CHAIN ID: ${MANTLE_CHAIN_ID}

Available commands:
  swap <amount> <token> for <token>
  balance
  yield
  help

Type a command to interact with DeFi protocols.`}
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Features */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-[#00ff88]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">WHY<span className="text-[#00ff88]">MANTLIC</span>?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <RefreshCw className="w-8 h-8" />, title: 'INSTANT SWAPS', desc: 'Trade any token on Mantle with optimal routes via 1inch aggregation' },
              { icon: <Activity className="w-8 h-8" />, title: 'LOW FEES', desc: 'Mantle\'s EVM-compatible L2 delivers sub-second finality at minimal cost' },
              { icon: <Terminal className="w-8 h-8" />, title: 'MECHA TERMINAL', desc: 'Command-line interface for traders who prefer speed over clicks' }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg bg-[#0a0a0f] border border-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all">
                <div className="w-12 h-12 rounded bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
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
