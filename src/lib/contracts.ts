// Mantle Sepolia (Testnet) Contract Addresses
export const CONTRACTS = {
  // ERC-8004 Agent Registry - UPDATE AFTER DEPLOYMENT
  AGENT_REGISTRY: '0x0000000000000000000000000000000000000001' as const,
  
  // On-chain Decision Logger - UPDATE AFTER DEPLOYMENT
  DECISION_LOGGER: '0x0000000000000000000000000000000000000002' as const,
  
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
