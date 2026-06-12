import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Mantlic — Terminal for DeFi',
  description: 'AI agent for DeFi on Mantle. One chat. Every protocol. No fluff.',
  metadataBase: new URL('https://mantlic.vercel.app'),
  openGraph: {
    title: 'Mantlic — Terminal for DeFi',
    description: 'AI agent for DeFi on Mantle. One chat. Every protocol. No fluff.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mantlic — Terminal for DeFi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MantleNetwork',
    creator: '@MantleNetwork',
    title: 'Mantlic — Terminal for DeFi',
    description: 'AI agent for DeFi on Mantle. One chat. Every protocol. No fluff.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}