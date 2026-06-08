import type { Metadata } from 'next'
// Fonts disabled - using local fonts
import './globals.css'

var inter = '';

var montserrat = '';

var orbitron = '';

export const metadata: Metadata = {
  title: 'FIFA 2026 AI Arbitrage Exchange | World Cup Sports Trading Platform',
  description: 'Real-time AI scans global markets and discovers profitable sports arbitrage opportunities every second. Premium AI-powered sports trading platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={['', montserrat, ''].filter(Boolean).join(' ')}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
