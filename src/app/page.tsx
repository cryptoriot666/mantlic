'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Send, Loader2, Bot, User, Zap, Shield, Wallet } from 'lucide-react'
import { AgentCard } from '@/components/AgentCard'
interface Message { role: 'user' | 'assistant'; content: string; status?: 'pending' | 'success' | 'error' }
export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Welcome to Mantlic! Connect your wallet to get started.' }])
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processing transfer...', status: 'pending' }])
      try {
        sendTransaction({ to: toAddress as `0x${string}`, value: parseEther(amount) })
        setTimeout(() => { setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: 'Sent! Transaction submitted.', status: 'success' } : m)) }, 2000)
      } catch { setMessages(prev => prev.map(m => m.status === 'pending' ? { ...m, content: 'Transaction failed.', status: 'error' } : m)) }
      setIsTyping(false)
      return
    }
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      if (userMessage.toLowerCase().includes('balance')) { const bal = balance ? parseFloat(balance.formatted).toFixed(4) : '0'; response = 'Balance: ' + bal + ' ' + (balance?.symbol || 'MNT') }
      else if (userMessage.toLowerCase().includes('address')) { response = 'Address: ' + (address?.slice(0, 6) || '?') + '...' + (address?.slice(-4) || '?') }
      else if (userMessage.toLowerCase().includes('who') || userMessage.toLowerCase().includes('what')) { response = "I am Mantlic - AI agent wallet on Mantle. Built for the Mantle Turing Test Hackathon 2026." }
      else { response = 'Try: "What is my balance?" or "Send 0.01 MNT to 0x..."' }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 800)
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Mantlic</h1><p className="text-xs text-slate-400">AI Agent Wallet on Mantle</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400"><Shield className="w-4 h-4 text-green-400" /><span>ERC-8004 Ready</span></div>
            <ConnectButton />
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {isConnected && (
            <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between text-sm border-b border-slate-700/50">
              <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-cyan-400" /><span className="text-slate-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span><span className="text-slate-500">|</span><span className="text-cyan-400">{balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0'} {balance?.symbol || 'MNT'}</span></div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Mantle Sepolia</span>
            </div>)}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={'flex gap-3 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ' + (msg.role === 'user' ? 'bg-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500')}>{msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}</div>
                <div className={'max-w-[80%] rounded-2xl px-4 py-3 ' + (msg.role === 'user' ? 'bg-cyan-500/20 text-cyan-100 rounded-tr-sm' : 'bg-slate-700/50 text-slate-100 rounded-tl-sm')}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.status === 'pending' && <div className="mt-2 flex items-center gap-2 text-xs text-amber-400"><Loader2 className="w-3 h-3 animate-spin" />Awaiting wallet...</div>}
                  {msg.status === 'success' && <div className="mt-2 text-xs text-green-400">Transaction successful</div>}
                  {msg.status === 'error' && <div className="mt-2 text-xs text-red-400">Transaction failed</div>}
                </div>
              </div>))}
            {isTyping && (<div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div><div className="bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
            {!isConnected ? (<div className="text-center py-4"><p className="text-slate-400 text-sm mb-3">Connect your wallet to start chatting</p><ConnectButton /></div>) : (
              <div className="flex gap-3">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask Mantlic... (e.g. What is my balance?)" className="flex-1 bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm" disabled={isTyping} />
                <button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 font-medium transition-all flex items-center gap-2">{isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
              </div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30"><div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3"><Bot className="w-5 h-5 text-cyan-400" /></div><h3 className="text-white font-medium mb-1">AI-Powered</h3><p className="text-slate-400 text-sm">Natural language commands for wallet operations</p></div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30"><div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3"><Shield className="w-5 h-5 text-green-400" /></div><h3 className="text-white font-medium mb-1">Non-Custodial</h3><p className="text-slate-400 text-sm">You control your keys. AI only executes what you approve.</p></div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3"><Zap className="w-5 h-5 text-purple-400" /></div><h3 className="text-white font-medium mb-1">ERC-8004 Identity</h3><p className="text-slate-400 text-sm">On-chain agent identity for transparent AI operations</p></div>
        </div>
        <div className="mt-6 max-w-md">
          <AgentCard />
        </div>
      </div>
    </main>
  )
}
