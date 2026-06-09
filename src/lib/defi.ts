import { parseUnits, formatUnits } from 'viem'

// Token addresses on Mantle Sepolia (update after deployment)
export const TOKENS = {
  WETH: '0x4200000000000000000000000000000000000006' as const,
  USDC: '0x0000000000000000000000000000000000000000' as const, // Update after deployment
  MNT: '0x0000000000000000000000000000000000000000' as const, // Native token, no address
} as const

export const MANTLE_SEPOLIA_CONFIG = {
  id: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
} as const

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  return formatUnits(amount, decimals)
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return parseUnits(amount, decimals)
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getExplorerUrl(txHash: string): string {
  return `${MANTLE_SEPOLIA_CONFIG.explorer}/tx/${txHash}`
}
