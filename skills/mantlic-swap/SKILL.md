---
name: mantlic-swap
description: Execute token swaps on Mantle via MantlicSwap DEX contract with real on-chain execution.
---

# Mantlic Swap Skill

Teach your agent how to execute real token swaps on Mantle Network using the MantlicSwap contract.

## Contract Addresses (Mantle Sepolia)
- **MantlicSwap:** `0x46da6883626f51c500c662f7B934FA7DD0abE105`
- **Agent Registry:** `0xbA7a32f1d19e10f6Aa47aBA168bE5aBD7aEF4349`
- **MockUSDC:** `0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C`

## Supported Tokens
| Symbol | Type | Address |
|--------|------|---------|
| MNT | Native | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` |
| USDC | ERC-20 | `0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C` |

## How to Execute a Swap

### Step 1: Get Quote
Call `getQuote(tokenIn, tokenOut, amountIn, slippageBps)` on MantlicSwap to calculate output.
- `slippageBps`: 50 = 0.5%, 100 = 1%, 500 = 5%
- Example: `getQuote(MNT, USDC, 0.1e18, 50)` → returns `950000000000000000` (0.095 USDC)

### Step 2: Execute Swap
Call `executeSwap(tokenIn, tokenOut, amountIn, minAmountOut, data)` with `value = amountIn` for MNT swaps.
- For MNT → USDC: `tokenIn = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
- For USDC → MNT: `tokenIn = 0xBa9e2526E2B3a7BFB3a665a399988866CA227E9C`
- `data` should be `0x` (empty bytes)

### Step 3: Wait for Confirmation
Wait for transaction receipt. Display TX hash and explorer link.

## Example Conversation Flow

**User:** "swap 0.1 MNT for USDC"

**Agent Response:**
```
Executing swap on Mantle Sepolia...
Quote: 0.1 MNT → 0.095 USDC (rate: $0.95/MNT, fee: 0.3%)
TX submitted: 0x14778cf49295822be5b296f5aa8d44d1cd6aa5abb08840438511f3f807435c05
✅ Confirmed! Received 0.095 USDC
🔗 https://sepolia.mantlescan.xyz/tx/0x14778cf49295822be5b296f5aa8d44d1cd6aa5abb08840438511f3f807435c05
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `execution reverted` | Wrong parameters | Check token addresses and amounts |
| `MNT transfer failed` | Contract out of liquidity | Use smaller amount or different token |
| `Insufficient MNT` | Not enough balance | Reduce swap amount |

## Pricing
- MantlicSwap fee: 0.3% (30 basis points)
- Current MNT price: $0.95 (hardcoded for demo)
- Explorer: https://sepolia.mantlescan.xyz

## Important Notes
- All swaps execute on Mantle Sepolia testnet (Chain ID: 5003)
- Test tokens have no real value
- Gas paid in MNT (Sepolia MNT is free from faucet)
- Swap is atomic — either fully succeeds or reverts
