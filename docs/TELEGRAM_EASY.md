# Mantlic Telegram Bot - Quick Start

A simple Telegram bot that calls the Mantlic AI API for DeFi on Mantle blockchain.

## No Dependencies Required

This bot uses only Node.js built-ins:
- `node:https` - Telegram API calls
- `node:fetch` - Mantlic API calls (Node 18+)
- `node:crypto` - Available if needed

**No npm install needed!** Just Node.js 18+.

## Setup

### 1. Create Your Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts - give it a name and username
4. Copy the bot token (looks like `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)

### 2. Run the Bot

```bash
# Set your token
export TELEGRAM_BOT_TOKEN=your_token_here

# Run the bot
node scripts/telegram-easy.mjs
```

Or in one line:
```bash
TELEGRAM_BOT_TOKEN=your_token_here node scripts/telegram-easy.mjs
```

### 3. Test It

1. Open your bot in Telegram
2. Send `/start`
3. Try `/balance`, `/swap`, `/yield`, or just ask a question!

## Available Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show all commands |
| `/balance` | Check wallet balances |
| `/swap [amount] [from] for [to]` | Token swap |
| `/yield` | Compare DeFi yields |
| Any text | AI-powered DeFi answers |

## Deploy to Production

### Option 1: Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variable: `TELEGRAM_BOT_TOKEN`
5. Set start command: `node scripts/telegram-easy.mjs`

### Option 2: Render

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect GitHub repo
5. Build Command: (leave empty - no build needed!)
6. Start Command: `node scripts/telegram-easy.mjs`
7. Add env var: `TELEGRAM_BOT_TOKEN`

### Option 3: Val Town

1. Go to [val.town](https://val.town)
2. Create a new val
3. Copy the code from `scripts/deploy-telegram.mjs`
4. Add secret: `TELEGRAM_BOT_TOKEN`
5. Run on schedule or via HTTP endpoint

### Option 4: VPS/Droplet

```bash
# SSH into your server
ssh user@your-server

# Install Node 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone https://github.com/your-repo/mantlic.git
cd mantlic

# Run with systemd
sudo tee /etc/systemd/system/mantlic-bot.service << 'EOF'
[Unit]
Description=Mantlic Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mantlic
ExecStart=/usr/bin/node scripts/telegram-easy.mjs
Restart=always
Environment=TELEGRAM_BOT_TOKEN=your_token_here

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mantlic-bot
sudo systemctl start mantlic-bot
```

## Troubleshooting

### "Cannot connect to Telegram"
- Check your bot token is correct
- Ensure you have internet access
- Try: `curl https://api.telegram.org/botYOUR_TOKEN/getMe`

### "AI error"
- The Mantlic API might be down
- Check the API URL is correct
- Try manually: `curl -X POST https://mantlic-8yzv3shi6-the-riot-s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hello"}],"address":"not connected","memories":[]}'`

### Bot not responding
- Make sure you started a chat with your bot
- Check the console for errors
- Try sending `/start` again

## Files

- `scripts/telegram-easy.mjs` - Main bot (standalone, no deps)
- `scripts/deploy-telegram.mjs` - Deployment-ready version
- `docs/TELEGRAM_EASY.md` - This file

## Architecture

```
Telegram User → Telegram API → Bot (long polling) → Mantlic API → AI Response
                     ↑                                              ↓
                     └──────────── sendMessage() ←─────────────────┘
```

The bot:
1. Long-polls Telegram for updates every 30 seconds
2. Parses commands (/start, /balance, etc.)
3. Forwards messages to Mantlic AI API
4. Sends AI response back to Telegram
