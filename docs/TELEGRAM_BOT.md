# Mantlic Telegram Bot

## Setup

1. Create bot via @BotFather on Telegram
2. Copy the bot token
3. Deploy the bot:

### Deploy to Railway/Render (free tier)

1. Create new project
2. Connect GitHub repo
3. Set env var: TELEGRAM_BOT_TOKEN=your_token
4. Set start command: npx tsx src/bot/telegram-bot.ts

Or run locally:
```bash
TELEGRAM_BOT_TOKEN=your_token npx tsx src/bot/telegram-bot.ts
```

## Bot Commands
- /start — Welcome message + web app link
- /swap — Swap instructions
- /yield — Yield data
- /help — All commands

## Webhook Mode (optional)

For production, use webhook mode instead of long-polling:
```typescript
const bot = new Bot(BOT_TOKEN)
bot.api.setWebhook('https://your-bot.up.railway.app/webhook')
```