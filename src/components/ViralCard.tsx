'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, Share2, Link2, TrendingUp, Users } from 'lucide-react'

export function ViralCard() {
  const [copied, setCopied] = useState(false)
  const [clicks, setClicks] = useState(0)
  
  const referralLink = typeof window !== 'undefined' 
    ? `https://mantlic.vercel.app?ref=${window.location.hostname}`
    : 'https://mantlic.vercel.app?ref=...'
  
  useEffect(() => {
    const stored = localStorage.getItem('mantlic_referral_clicks')
    if (stored) setClicks(parseInt(stored))
  }, [])
  
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    const newClicks = clicks + 1
    setClicks(newClicks)
    localStorage.setItem('mantlic_referral_clicks', newClicks.toString())
    setTimeout(() => setCopied(false), 2000)
  }
  
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=I just found Mantlic - an AI agent for DeFi on %40MantleNetwork. Terminal-style trading with natural language commands. Try it: ${encodeURIComponent(referralLink)}`, '_blank')
  }
  
  return (
    <div className="bg-[#0f0f15] rounded-xl border border-[#00ff88]/30 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#00ff88]" />
        <span className="font-bold text-white">SHARE & EARN</span>
      </div>
      <p className="text-gray-400 text-sm mb-4">Share your referral link. Every friend who connects = bonus points for your agent.</p>
      <div className="flex gap-2 mb-4">
        <input readOnly value={referralLink} className="flex-1 bg-[#0a0a0f] border border-[#00ff88]/20 rounded px-3 py-2 text-xs font-mono text-gray-400" />
        <button onClick={copyLink} className="btn-glow bg-[#00ff88] text-black px-4 py-2 rounded font-bold text-sm flex items-center gap-1">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={shareTwitter} className="flex-1 btn-glow bg-[#1DA1F2]/20 border border-[#1DA1F2]/50 text-[#1DA1F2] px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> Twitter
        </button>
        <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Mantlic - AI Agent for DeFi`, '_blank')} className="flex-1 btn-glow bg-[#0088cc]/20 border border-[#0088cc]/50 text-[#0088cc] px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
          <Users className="w-4 h-4" /> Telegram
        </button>
      </div>
      {clicks > 0 && <div className="mt-3 text-center text-xs text-[#00ff88]/60 font-mono">{clicks} referral clicks tracked</div>}
    </div>
  )
}
