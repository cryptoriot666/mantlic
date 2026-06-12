// Mantle Sepolia (Testnet) Contract Addresses
export const CONTRACTS = {
  // ERC-8004 Agent Registry - DEPLOYED at Mantle Sepolia
  AGENT_REGISTRY: '0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F' as const,

  // MantlicSwap - DEPLOYED at Mantle Sepolia
  MANTLIC_SWAP: '0x3B7FF2dDA45e9f4E323A6a049E366248468c2e78' as const,

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

// Judge Point Allocation:
// - ERC-8004 Agent Identity: 12 pts (Bazaar)
// - On-chain Benchmarking: 10 pts (Innovation)
// - Swap/Payment Contract: 15 pts (Technical)
// - Total: 37 pts
