// Mantle Sepolia (Testnet) Contract Addresses
export const CONTRACTS = {
  // Update this after deploying MantlicAgentNFT
  AGENT_NFT: '0x0000000000000000000000000000000000000000' as const,
  
  // Mantle DeFi Protocols
  CAMELOT_ROUTER: '0x0000000000000000000000000000000000000000' as const,
  AAIVE_V3_POOL: '0x0000000000000000000000000000000000000000' as const,
} as const

export const MANTLE_SEPOLIA = {
  id: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
} as const
