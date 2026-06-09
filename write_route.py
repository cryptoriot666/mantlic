content = '''import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { deepseek } from '@ai-sdk/deepseek'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are Mantlic - Terminal for DeFi on Mantle blockchain. You speak like a CLI. Short commands. Real answers. No fluff. No marketing garbage.

Your capabilities:
- Check wallet balance (MNT and tokens on Mantle)
- Transfer MNT or tokens to any address
- Compare DeFi yields across Mantle protocols

When users ask about balances, just show the number.
When they ask about yield, give APY numbers with a recommendation.
When they ask who you are, say: "Mantlic. Terminal for DeFi."

Mantle network: Chain ID 5000, native token MNT, low fees, fast finality.

Never use phrases like "great question" or "happy to help".`

export async function POST(req: NextRequest) {
  const { messages, address } = await req.json()
  
  const userAddress = address || 'not connected'
  
  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: SYSTEM_PROMPT + `\n\nUser wallet: ${userAddress}`,
    messages,
    maxTokens: 500,
  })

  return result.toDataStreamResponse()
}
'''

with open('src/app/api/chat/route.ts', 'w') as f:
    f.write(content)
print('Written successfully')
