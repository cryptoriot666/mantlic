import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, coinbaseWallet, walletConnectWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets'
import { QueryClient } from '@tanstack/react-query'

export const mantle = {
  id: 5000, name: 'Mantle', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mantle.xyz'] }, public: { http: ['https://rpc.mantle.xyz'] } },
  blockExplorers: { etherscan: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' }, default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' } },
  contracts: { multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' as const } },
} as const

export const mantleSepolia = {
  id: 5003, name: 'Mantle Sepolia', nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sepolia.mantle.xyz'] }, public: { http: ['https://rpc.sepolia.mantle.xyz'] } },
  blockExplorers: { etherscan: { name: 'Mantle Testnet Explorer', url: 'https://sepolia.mantlescan.xyz' }, default: { name: 'Mantle Testnet Explorer', url: 'https://sepolia.mantlescan.xyz' } },
  contracts: { multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' as const } },
} as const

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'

const connectors = connectorsForWallets([
  { groupName: 'Recommended', wallets: [metaMaskWallet, coinbaseWallet, rainbowWallet, walletConnectWallet] },
], { appName: 'Mantlic', projectId })

export const config = createConfig({
  connectors, chains: [mantleSepolia, mantle, mainnet],
  transports: { [mantleSepolia.id]: http(), [mantle.id]: http(), [mainnet.id]: http() },
})

export const queryClient = new QueryClient()
