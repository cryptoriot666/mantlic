import { NextRequest, NextResponse } from 'next/server'
import { CONTRACTS, MANTLE_SEPOLIA } from '@/lib/contracts'

export async function POST(req: NextRequest) {
  const { address, agentName } = await req.json()
  
  if (!address || !agentName) {
    return NextResponse.json({ error: 'Missing address or agentName' }, { status: 400 })
  }

  // Check if contract is deployed
  if (CONTRACTS.AGENT_REGISTRY === '0x0000000000000000000000000000000000000001') {
    return NextResponse.json({
      success: false,
      error: 'Contract not deployed yet',
      instructions: {
        step1: 'Go to https://remix.ethereum.org',
        step2: 'Create new file: MantlicAgentNFT.sol',
        step3: 'Paste contract from /contracts/MantlicAgentNFT.sol',
        step4: 'Compile with Solidity 0.8.20+',
        step5: 'Deploy to Mantle Sepolia (Chain ID 5003)',
        step6: 'Update CONTRACTS.AGENT_REGISTRY in src/lib/contracts.ts',
        faucet: MANTLE_SEPOLIA.faucet,
      }
    }, { status: 400 })
  }

  // Real contract interaction would go here
  // For now, return mock data
  const mockTokenId = Math.floor(Math.random() * 10000) + 1
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  
  return NextResponse.json({
    success: true,
    tokenId: mockTokenId,
    txHash,
    agentName,
    owner: address,
    chain: 'mantle-sepolia',
    contract: CONTRACTS.AGENT_REGISTRY,
    explorerUrl: `${MANTLE_SEPOLIA.explorer}/tx/${txHash}`,
    message: 'Agent identity NFT minted (demo mode)',
  })
}
