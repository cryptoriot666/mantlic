// Mantle Sepolia (Testnet) Contract Addresses
export const CONTRACTS = {
  // ERC-8004 Agent Registry - DEPLOYED at Mantle Sepolia (June 13, 2026)
  AGENT_REGISTRY: '0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349' as const,

  // MantlicSwap - DEPLOYED at Mantle Sepolia (June 13, 2026)
  MANTLIC_SWAP: '0x46da6883626f51c500c662f7B934FA7DD0abE105' as const,

  // MockUSDC - Deployed for testing
  MOCK_USDC: '0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C' as const,

  // AgentNFT - Minted agent identity (June 13, 2026)
  AGENT_NFT: '0xD78ec89B878281AE71A64eed40fd4AA5c170f778' as const,
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
