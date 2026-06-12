# Contributing to Mantlic

Thank you for your interest in contributing to Mantlic!

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/cryptoriot666/mantlic.git
   cd mantlic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   DEEPSEEK_API_KEY=sk-your-deepseek-key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
   NEXT_PUBLIC_1INCH_API_KEY=your-1inch-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to see the app.

### Network Configuration

To connect to Mantle Sepolia testnet in MetaMask:
- Network Name: `Mantle Sepolia Testnet`
- RPC URL: `https://rpc.sepolia.mantle.xyz`
- Chain ID: `5003`
- Currency Symbol: `MNT`
- Block Explorer: `https://sepolia.mantlescan.xyz`

Get test MNT from the [Mantle Faucet](https://www.l2faucet.com/mantle).

### Project Structure

```
mantlic/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities (wagmi, 1inch, etc.)
│   ├── commands/     # AI command handlers
│   ├── agents/       # Agent logic
│   └── hooks/        # Custom React hooks
├── contracts/         # Solidity smart contracts
├── docs/             # Documentation
└── scripts/          # Deployment scripts
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npx hardhat compile` | Compile smart contracts |
| `npx hardhat test` | Run contract tests |

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Deploy to Mantle Sepolia
npx hardhat run scripts/deploy.ts --network mantle-sepolia

# Run tests
npx hardhat test
```

### Code Style

- Use TypeScript for all new code
- Follow the existing patterns in the codebase
- Run `npm run lint` before committing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Issues

Found a bug? Open an issue on GitHub with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, etc.)

---

Built for the Mantle Turing Test Hackathon 2026
