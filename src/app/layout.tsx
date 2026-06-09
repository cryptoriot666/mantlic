import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
export const metadata: Metadata = {
  title: 'Mantlic - AI Agent Wallet on Mantle',
  description: 'Conversational AI agent wallet for Mantle. Click, chat, done.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
