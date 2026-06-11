'use client'
import { useReadContract, useWriteContract, useAccount } from 'wagmi'

const AGENT_REGISTRY_ADDRESS = '0x59f18816D6F3E15f3a4B41c73810e7DDF50D1a1F' as const

const AGENT_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'capabilities', type: 'string' }
    ],
    name: 'registerAgent',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'benchmarkType', type: 'string' },
      { name: 'score', type: 'uint256' },
      { name: 'latencyMs', type: 'uint256' },
      { name: 'costGas', type: 'uint256' },
      { name: 'metadataURI', type: 'string' }
    ],
    name: 'recordBenchmark',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'agentId', type: 'uint256' }],
    name: 'getBenchmarkResults',
    outputs: [{
      components: [
        { name: 'agentId', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'totalScore', type: 'uint256' },
        { name: 'benchmarkCount', type: 'uint256' },
        { name: 'lastBenchmarkType', type: 'string' }
      ],
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'benchmarkType', type: 'string' },
      { name: 'limit', type: 'uint256' }
    ],
    name: 'getTopAgentsByBenchmark',
    outputs: [{
      components: [
        { name: 'agentId', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'score', type: 'uint256' },
        { name: 'benchmarkCount', type: 'uint256' }
      ],
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'agentId', type: 'uint256' }],
    name: 'getAgentInfo',
    outputs: [{
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'metadataURI', type: 'string' },
        { name: 'reputationScore', type: 'uint256' },
        { name: 'totalTransactions', type: 'uint256' },
        { name: 'registeredAt', type: 'uint256' }
      ],
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface BenchmarkResult {
  agentId: bigint
  name: string
  score: bigint
  benchmarkCount: bigint
}

export interface AgentInfo {
  id: bigint
  name: string
  metadataURI: string
  reputationScore: bigint
  totalTransactions: bigint
  registeredAt: bigint
}

export function useTopAgents(benchmarkType: string = 'dex_arbitrage', limit: number = 5) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getTopAgentsByBenchmark',
    args: [benchmarkType, BigInt(limit)],
    chainId: 5003,
  })
}

export function useAgentInfo(agentId: bigint = 1n) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getAgentInfo',
    args: [agentId],
    chainId: 5003,
  })
}

export function useAgentBenchmarkResults(agentId: bigint = 1n) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getBenchmarkResults',
    args: [agentId],
    chainId: 5003,
  })
}

export function useRegisterAgent() {
  const { address } = useAccount()
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const register = (name: string, metadataURI: string, capabilities: string) => {
    if (!address) return
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'registerAgent',
      args: [name, metadataURI, capabilities],
      chainId: 5003,
    })
  }

  return { register, hash, isPending, error, address }
}

export function useRecordBenchmark() {
  const { address } = useAccount()
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const record = (
    agentId: number,
    benchmarkType: string,
    score: number,
    latencyMs: number,
    costGas: number,
    metadataURI: string
  ) => {
    if (!address) return
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'recordBenchmark',
      args: [BigInt(agentId), benchmarkType, BigInt(score), BigInt(latencyMs), BigInt(costGas), metadataURI],
      chainId: 5003,
    })
  }

  return { record, hash, isPending, error, address }
}