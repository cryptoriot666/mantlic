'use client'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config, queryClient, mantleSepolia } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          initialChain={mantleSepolia.id}
          theme={darkTheme({ accentColor: '#00AEEF', accentColorForeground: 'white', borderRadius: 'large' })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
