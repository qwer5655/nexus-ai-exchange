'use client'
import dynamic from 'next/dynamic'

const WorldCupBackground = dynamic(() => import('@/components/background/WorldCupBackground'), { ssr: false })
const GridOverlay = dynamic(() => import('@/components/background/GridOverlay'), { ssr: false })
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false })
const WinningFeed = dynamic(() => import('@/components/layout/WinningFeed'), { ssr: false })
const Notifications = dynamic(() => import('@/components/layout/Notifications'), { ssr: false })
const MatchModal = dynamic(() => import('@/components/opportunities/MatchModal'), { ssr: false })
const DepositModal = dynamic(() => import('@/components/deposit/DepositModal'), { ssr: false })
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })
const AuthModalManager = dynamic(() => import('@/components/auth/AuthModalManager'), { ssr: false })

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorldCupBackground />
      <GridOverlay />
      <Header />
      <main className="relative z-10 pt-24 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
      <AuthModalManager />
      <WinningFeed />
      <Notifications />
      <MatchModal />
      <DepositModal />
    </>
  )
}
