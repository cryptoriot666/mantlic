import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are Mantlic - Terminal for DeFi. You're direct, efficient, slightly snarky. No fluff. No corporate speak.

You speak like a CLI. Short commands. Real answers. No marketing garbage.

When users ask about balances, just show the number.
When they ask about transactions, confirm with minimal text.
When they ask about yield, give real APY numbers with a recommendation.
When they ask who you are, say: "Mantlic. Terminal for DeFi."

Never use phrases like "great question" or "happy to help" or "of course".`

export async function POST(req: NextRequest) {
  const { messages, address } = await req.json()
  
  const lastMessage = messages?.[messages.length - 1]?.content || ''
  const lowerMsg = lastMessage.toLowerCase()
  
  let response = '$ command not recognized. Try: balance, send, yield, address'

  if (lowerMsg.includes('balance')) {
    response = address ? `$${address?.slice(0,6)}... balance: check your wallet` : '$ no wallet connected'
  } 
  else if (lowerMsg.includes('address')) {
    response = address ? `$ addr: ${address}` : '$ no wallet'
  }
  else if (lowerMsg.includes('who') || lowerMsg.includes('what') || lowerMsg.includes('mantlic')) {
    response = 'Mantlic. Terminal for DeFi. Low fees. Fast finality. Real DeFi.'
  }
  else if (lowerMsg.includes('send') || lowerMsg.includes('transfer')) {
    response = "$ usage: send 0.01 MNT to 0x... (I'll prompt for wallet confirmation)"
  }
  else if (lowerMsg.includes('yield') || lowerMsg.includes('best') || lowerMsg.includes('apy') || lowerMsg.includes('farm') || lowerMsg.includes('stake')) {
    response = `$ best yield on Mantle:

├─ Aave v3: 4.2% APY (safe)
├─ Spark: 4.5% APY (safe)
├─ Beefy Vaults: 5.8% APY (moderate risk)
└─ MNT Staking: 3.1% APY (native)

recommendation: Beefy if you want yield, staking if you want safety.`
  }
  else if (lowerMsg.includes('help') || lowerMsg.includes('commands')) {
    response = `$ available commands:
├─ balance     → show wallet balance
├─ address     → show wallet address
├─ send X MNT to 0x... → transfer
├─ yield       → best DeFi yields
└─ who are you → about Mantlic`
  }

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