'use client'
import { useState, useEffect } from 'react'

interface AgentMemory {
  key: string
  value: string
  timestamp: number
}

export function useAgentMemory(address: string | undefined) {
  const [memories, setMemories] = useState<AgentMemory[]>([])
  
  useEffect(() => {
    if (!address) return
    const stored = localStorage.getItem(`mantlic_mem_${address}`)
    if (stored) {
      try { setMemories(JSON.parse(stored)) } catch {}
    }
  }, [address])
  
  const remember = (key: string, value: string) => {
    if (!address) return
    const updated = [...memories.filter(m => m.key !== key), { key, value, timestamp: Date.now() }]
    setMemories(updated)
    localStorage.setItem(`mantlic_mem_${address}`, JSON.stringify(updated))
  }
  
  const recall = (key: string) => memories.find(m => m.key === key)?.value
  
  return { memories, remember, recall }
}