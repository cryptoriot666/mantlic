import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, address } = await req.json()
  
  // Simple mock response for demo - in production use @ai-sdk/openai
  const lastMessage = messages?.[messages.length - 1]?.content || ''
  
  let response = "I'm Mantlic, your AI agent wallet on Mantle. How can I help you today?"
  
  if (lastMessage.toLowerCase().includes('balance')) {
    response = `Your wallet ${address ? `(${address.slice(0,6)}...${address.slice(-4)})` : ''} is connected. Check your connected wallet for the balance.`
  } else if (lastMessage.toLowerCase().includes('address')) {
    response = address ? `Your address: ${address}` : 'No wallet connected'
  } else if (lastMessage.toLowerCase().includes('who') || lastMessage.toLowerCase().includes('what')) {
    response = "I am Mantlic - an AI agent wallet on Mantle blockchain. Built for the Mantle Turing Test Hackathon 2026."
  } else if (lastMessage.toLowerCase().includes('send')) {
    response = "To send a transaction, use the format: Send X MNT to 0x... I'll confirm before executing."
  }
  
  // Return as text stream for compatibility with useChat
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: response })}\n\n`))
      controller.close()
    }
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
