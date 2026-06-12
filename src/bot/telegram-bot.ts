import { Bot, Context } from 'grammy'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

if (!BOT_TOKEN) {
  console.log('TELEGRAM_BOT_TOKEN not set — bot not started')
  console.log('To create a bot:')
  console.log('1. Message @BotFather on Telegram')
  console.log('2. Send /newbot')
  console.log('3. Copy the token')
  console.log('4. Set TELEGRAM_BOT_TOKEN env var')
  process.exit(0)
}

type MyContext = Context

const bot = new Bot<MyContext>(BOT_TOKEN)

bot.on('message', async (ctx) => {
  const text = ctx.message?.text || ''
  
  if (text === '/start') {
    await ctx.reply(`🤖 Mantlic AI Agent — Telegram Interface

Welcome to Mantlic on Telegram!

Your DeFi commands:
• /swap - Swap tokens
• /yield - Check yields
• /help - All commands

🌐 Web App: https://mantlic.vercel.app
📊 Agent Registry: 0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F`)
    return
  }
  
  if (text === '/swap' || text === '/help') {
    await ctx.reply(`💱 Mantlic Swap Commands

Open the web app to swap:
https://mantlic.vercel.app

Commands in web app:
• swap 100 MNT for USDC
• balance
• yield
• register agent <name>

Contract: 0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78`)
    return
  }
  
  if (text === '/yield') {
    await ctx.reply(`📈 DeFi Yields on Mantle

Agni Finance: ~12.4% APY (MNT-USDC)
Merchant Moe: ~8.7% APY (MNT-USDT)
Lendle: ~6.2% APY (USDC Lending)

For full yield comparison, open the web app:
https://mantlic.vercel.app

Type "yield" in the chat interface.`)
    return
  }
  
  await ctx.reply(`🤖 Mantlic Bot

Unknown command. Try:
• /start - Welcome
• /swap - Swap tokens
• /yield - Check yields
• /help - Help

🌐 Web: https://mantlic.vercel.app`)
})

bot.catch(console.error)
bot.start()
console.log('Mantlic Telegram bot started!')