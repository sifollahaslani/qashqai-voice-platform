import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QashqAI Voice',
  description:
    'A cultural–technological initiative for preserving endangered languages through ethical artificial intelligence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
