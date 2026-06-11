import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { deepseek } from '@ai-sdk/deepseek'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, address, memories } = await req.json()
  
  let systemContext = `You are Mantlic - Terminal AI Agent for DeFi on Mantle blockchain. You speak like a CLI. Short commands. Real answers. No fluff. No marketing garbage.

Your capabilities:
- Check wallet balance (MNT and tokens on Mantle)
- Transfer MNT or tokens to any address
- Compare DeFi yields across Mantle protocols
- Execute token swaps
- Register as an AI agent on the Mantlic registry

Available commands:
- swap <amount> <token> for <token> - Execute a token swap
- balance - Show wallet token balances
- yield - Compare DeFi yields across Mantle
- help - Show all available commands
- register agent <name> - Register as an AI agent

Mantle network: Chain ID 5000, native token MNT, low fees, fast finality.
Mantle Sepolia testnet: Chain ID 5003`

  // Add wallet info if connected
  if (address && address !== 'not connected') {
    systemContext += `\n\nUser wallet address: ${address}\nUser is connected with an active wallet.`
  } else {
    systemContext += `\n\nUser wallet: NOT CONNECTED\nUser needs to connect their wallet to access DeFi features.`
  }
  
  // Add agent memory context
  if (memories && memories.length > 0) {
    systemContext += `\n\nAgent memory (recent interactions):\n${memories}`
  }
  
  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: systemContext,
    messages,
  })

  return result.toTextStreamResponse()
}