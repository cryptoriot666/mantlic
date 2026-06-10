// Mantle Sepolia (Testnet) Contract Addresses
export const CONTRACTS = {
  // ERC-8004 Agent Registry - DEPLOYED
  AGENT_REGISTRY: '0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F' as const,
  
  // On-chain Decision Logger - placeholder
  DECISION_LOGGER: '0x0000000000000000000000000000000000000000' as const,
  
  // Mantle DeFi Protocols
  CAMELOT_ROUTER: '0x0000000000000000000000000000000000000000' as const,
} as const

export const MANTLE_SEPOLIA = {
  id: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
  faucet: 'https://www.l2faucet.com/mantle',
} as const
