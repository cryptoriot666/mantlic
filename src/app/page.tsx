'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Loader2, Bot, User, Zap, Terminal } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string; status?: 'pending' | 'success' | 'error' }

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Mantlic online. What do you need?' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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
      }
      else if (userMessage.toLowerCase().includes('address')) {
        response = address || 'No wallet'
      }
      else if (userMessage.toLowerCase().includes('who') || userMessage.toLowerCase().includes('what')) {
        response = "Mantlic. Terminal for DeFi. Low fees. Fast finality. Real DeFi."
      }
      else if (userMessage.toLowerCase().includes('yield') || userMessage.toLowerCase().includes('best')) {
        response = `Best yield opportunities on Mantle:

├─ Aave v3: 4.2% APY
├─ Spark: 4.5% APY  
├─ Beefy/MetaVault: 5.8% APY
└─ Staking MNT: 3.1% APY

Highest risk-adjusted: Beefy. I can move funds if you want.`
      }
      else {
        response = 'Commands: "balance", "send X MNT to 0x...", "best yield", "address"'
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 600)
  }

  return (
    <main className="min-h-screen bg-black">
      <header className="border-b border-orange-900/30 bg-black/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-mono">Mantlic</h1>
              <p className="text-xs text-orange-400/70">Terminal for DeFi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">Low fees. Fast finality. Real DeFi.</span>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-zinc-950 rounded-lg border border-orange-900/30 overflow-hidden h-[75vh] flex flex-col">
          {isConnected && (
            <div className="bg-zinc-900/80 px-4 py-2 flex items-center justify-between text-xs font-mono border-b border-orange-900/20">
              <div className="flex items-center gap-3">
                <span className="text-orange-400">$</span>
                <span className="text-slate-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <span className="text-slate-600">|</span>
                <span className="text-orange-400">{balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0'} {balance?.symbol || 'MNT'}</span>
              </div>
              <span className="text-green-500/70 bg-green-500/10 px-2 py-0.5 rounded">Mantle Sepolia</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={'flex gap-3 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
                <div className={'w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs ' + (msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-orange-400')}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={'max-w-[85%] px-3 py-2 ' + (msg.role === 'user' ? 'bg-orange-600/20 text-orange-100' : 'bg-zinc-900 text-slate-300')}>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</pre>
                  {msg.status === 'pending' && <div className="mt-2 flex items-center gap-2 text-xs text-amber-500"><Loader2 className="w-3 h-3 animate-spin" />processing...</div>}
                  {msg.status === 'success' && <div className="mt-1 text-xs text-green-500">✓ tx confirmed</div>}
                  {msg.status === 'error' && <div className="mt-1 text-xs text-red-500">✗ failed</div>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded bg-zinc-800 text-orange-400 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                <div className="bg-zinc-900 px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-orange-900/30 bg-zinc-950">
            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm mb-3 font-mono">$ connect wallet to start</p>
                <ConnectButton />
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="$ type command..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-600/50 font-mono text-sm"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded px-5 py-3 transition-colors flex items-center gap-2 font-mono"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}