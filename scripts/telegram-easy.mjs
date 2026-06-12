#!/usr/bin/env node
/**
 * Mantlic Telegram Bot - Plain JavaScript, No Dependencies
 * 
 * Run: TELEGRAM_BOT_TOKEN=xxx node scripts/telegram-easy.mjs
 */

import https from 'node:https';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MANTLIC_API = 'https://mantlic-8yzv3shi6-the-riot-s-projects.vercel.app/api/chat';

if (!TELEGRAM_TOKEN) {
  console.error('ERROR: Missing TELEGRAM_BOT_TOKEN');
  console.error('Run: TELEGRAM_BOT_TOKEN=xxx node scripts/telegram-easy.mjs');
  process.exit(1);
}

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
let lastUpdateId = 0;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    }).on('error', reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname, path: urlObj.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(options, (res) => {
      let response = '';
      res.on('data', chunk => response += chunk);
      res.on('end', () => { try { resolve(JSON.parse(response)); } catch { resolve(response); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendMessage(chatId, text, replyTo) {
  const body = { chat_id: chatId, text: text.slice(0, 4096) };
  if (replyTo) body.reply_to_message_id = replyTo;
  return httpsPost(`${BASE_URL}/sendMessage`, body);
}

async function callMantlicAPI(message) {
  const payload = { messages: [{ role: 'user', content: message }], address: 'not connected', memories: [] };
  try {
    const response = await fetch(MANTLIC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value, { stream: true });
    }
    // Parse streaming: data: 0:"text"
    fullResponse = fullResponse.split('\n')
      .filter(line => line.startsWith('data: '))
      .map(line => {
        const match = line.slice(6).match(/^\d+:"(.*)"$/s);
        return match ? match[1] : line;
      })
      .join('')
      .replace(/\n/g, '\n').replace(/\\"/g, '"');
    return fullResponse || 'No response';
  } catch (error) {
    return `AI error: ${error.message}`;
  }
}

async function handleCommand(chatId, messageId, text, username) {
  const cmd = text.trim().toLowerCase();
  const name = username ? `@${username}` : 'User';
  console.log(`> ${name}: ${text}`);

  if (cmd === '/start') {
    await sendMessage(chatId, 'Mantlic Bot - DeFi on Mantle\n\n/balance - Check wallet\n/swap - Token swap\n/yield - Compare yields\n/help - Commands\n\nOr ask anything!', messageId);
  }
  else if (cmd === '/help') {
    await sendMessage(chatId, 'Commands:\n/balance - Wallet balances\n/swap - Token swap\n/yield - Compare yields\n/start - Welcome', messageId);
  }
  else if (cmd === '/balance') {
    const r = await callMantlicAPI('Show MNT and token balances on Mantle. Be brief.');
    await sendMessage(chatId, `Balance:\n${r}`, messageId);
  }
  else if (cmd.startsWith('/swap')) {
    const args = cmd.replace('/swap', '').trim();
    if (args) {
      const r = await callMantlicAPI(`${args} - Execute swap on Mantle. Show details.`);
      await sendMessage(chatId, `Swap:\n${r}`, messageId);
    } else {
      await sendMessage(chatId, 'Swap: /swap 100 MNT for USDC\nSupported: MNT, USDC, USDT, WETH, WBTC', messageId);
    }
  }
  else if (cmd === '/yield') {
    const r = await callMantlicAPI('Compare DeFi yields on Mantle. Show APY ranges.');
    await sendMessage(chatId, `Yields:\n${r}`, messageId);
  }
  else if (cmd.startsWith('/')) {
    const r = await callMantlicAPI(`Unknown: ${text}. Suggest command.`);
    await sendMessage(chatId, r, messageId);
  }
  else {
    const r = await callMantlicAPI(text);
    await sendMessage(chatId, r, messageId);
  }
}

async function poll() {
  try {
    const r = await httpsGet(`${BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30&allowed_updates=message`);
    if (r.ok && r.result && r.result.length > 0) {
      for (const u of r.result) {
        lastUpdateId = u.update_id;
        if (u.message && u.message.text) {
          const m = u.message;
          await handleCommand(m.chat.id, m.message_id, m.text, m.from?.username);
        }
      }
    }
  } catch (e) {
    console.error('Poll error:', e.message);
    await new Promise(r => setTimeout(r, 5000));
  }
}

async function main() {
  console.log('Mantlic Bot Starting...');
  try {
    const me = await httpsGet(`${BASE_URL}/getMe`);
    if (me.ok) console.log(`Bot: @${me.result.username}`);
    else { console.error('Auth failed:', me.description); process.exit(1); }
  } catch (e) { console.error('Cannot connect:', e.message); process.exit(1); }
  console.log('Running! Ctrl+C to stop\n');
  while (true) await poll();
}

process.on('SIGINT', () => { console.log('Stopped'); process.exit(0); });
process.on('SIGTERM', () => { console.log('Stopped'); process.exit(0); });
main().catch(console.error);
