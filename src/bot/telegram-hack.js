const { Bot } = require('grammy');
const https = require('https');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// MNT RPC configuration
const MNT_RPC = 'https://rpc.sepolia.mantle.xyz';
const REGISTRY_ADDRESS = '0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349';
const EXPLORER = 'https://sepolia.mantlescan.xyz';
const WEB = 'https://mantlic.vercel.app';

// Helper: JSON-RPC call
function rpcCall(method, params) {
  return new Promise(function(resolve, reject) {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params
    });
    
    const options = {
      hostname: 'rpc.sepolia.mantle.xyz',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, function(res) {
      let body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper: get MNT balance
async function getBalance(address) {
  const result = await rpcCall('eth_getBalance', [address, 'latest']);
  if (result.error) throw new Error(result.error.message);
  return parseInt(result.result, 16) / 1e18;
}

// /start command
bot.command('start', async function(ctx) {
  await ctx.reply(
    'Welcome to Mantlic Bot!

' +
    'Available commands:
' +
    '/balance <address> - Check MNT balance
' +
    '/yield - Compare yields
' +
    '/leaderboard - View agent rankings
' +
    '/help - Show help'
  );
});

// /balance command
bot.command('balance', async function(ctx) {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    await ctx.reply('Usage: /balance <address>');
    return;
  }
  
  const address = args[1];
  try {
    const balance = await getBalance(address);
    await ctx.reply(
      'Balance: ' + balance.toFixed(4) + ' MNT
' +
      'View on explorer: ' + EXPLORER + '/address/' + address
    );
  } catch (e) {
    await ctx.reply('Error fetching balance: ' + e.message);
  }
});

// /yield command
bot.command('yield', async function(ctx) {
  await ctx.reply(
    'Yield Comparison:

' +
    'Current APY estimates:
' +
    '- Mantle Lend: ~5.2%
' +
    '- Staking: ~4.8%
' +
    '- Liquidity Pool: ~6.1%

' +
    'Visit ' + WEB + ' for details'
  );
});

// /leaderboard command
bot.command('leaderboard', async function(ctx) {
  await ctx.reply(
    'Agent Leaderboard:

' +
    '1. Agent Alpha - 10,250 pts
' +
    '2. Agent Beta - 8,100 pts
' +
    '3. Agent Gamma - 7,450 pts

' +
    'Top agents by performance score.'
  );
});

// /help command
bot.command('help', async function(ctx) {
  await ctx.reply(
    'Mantlic Bot Help

' +
    'This bot provides tools for Mantle ecosystem:

' +
    '/start - Welcome message
' +
    '/balance <address> - Check MNT token balance
' +
    '/yield - View yield comparison
' +
    '/leaderboard - View agent rankings
' +
    '/help - Show this message

' +
    'Registry: ' + REGISTRY_ADDRESS + '
' +
    'Explorer: ' + EXPLORER + '
' +
    'Web: ' + WEB
  );
});

// Start bot
bot.start();
console.log('Mantlic Telegram bot started');
