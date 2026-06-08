'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const BootSequence = dynamic(() => import('@/components/background/BootSequence'), { ssr: false })
const WorldCupBackground = dynamic(() => import('@/components/background/WorldCupBackground'), { ssr: false })
const GridOverlay = dynamic(() => import('@/components/background/GridOverlay'), { ssr: false })
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false })
const HeroSection = dynamic(() => import('@/components/hero/HeroSection'), { ssr: false })
const HUDPanels = dynamic(() => import('@/components/layout/HUDPanels'), { ssr: false })
const PlayersSection = dynamic(() => import('@/components/player/PlayersSection'), { ssr: false })
const LiveStats = dynamic(() => import('@/components/stats/LiveStats'), { ssr: false })
const TrustBar = dynamic(() => import('@/components/stats/TrustBar'), { ssr: false })
const OpportunityTable = dynamic(() => import('@/components/opportunities/OpportunityTable'), { ssr: false })
const LeaderboardTable = dynamic(() => import('@/components/leaderboard/LeaderboardTable'), { ssr: false })
const WinningFeed = dynamic(() => import('@/components/layout/WinningFeed'), { ssr: false })
const Notifications = dynamic(() => import('@/components/layout/Notifications'), { ssr: false })
const MatchModal = dynamic(() => import('@/components/opportunities/MatchModal'), { ssr: false })
const DepositModal = dynamic(() => import('@/components/deposit/DepositModal'), { ssr: false })
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })

export default function HomePage() {
  // Start as 'checking' - show nothing until we decide
  var [state, setState] = useState('checking')

  useEffect(function() {
    var params = new URLSearchParams(window.location.search)
    var forceBoot = params.get('boot') === 'true'

    if (forceBoot) {
      localStorage.removeItem('nexus_boot_completed')
      setState('boot')
    } else {
      var completed = localStorage.getItem('nexus_boot_completed') === 'true'
      setState(completed ? 'ready' : 'boot')
    }
  }, [])

  var handleBootComplete = useCallback(function() {
    localStorage.setItem('nexus_boot_completed', 'true')
    setState('ready')
  }, [])

  // Show nothing while checking
  if (state === 'checking') {
    return (
      <div className="fixed inset-0" style={{ backgroundColor: '#020305' }} />
    )
  }

  // Show boot sequence
  if (state === 'boot') {
    return (
      <>
        <div className="fixed inset-0 z-[99]" style={{ backgroundColor: '#020305' }} />
        <BootSequence onComplete={handleBootComplete} />
      </>
    )
  }

  // Show main content
  return (
    <>
      <WorldCupBackground />
      <GridOverlay />
      <Header />
      <main className="relative z-10">
        <div className="relative">
          <HeroSection />
          <HUDPanels />
        </div>
        <TrustBar />
        <LiveStats />
        <PlayersSection />
        <OpportunityTable />
        <LeaderboardTable />
      </main>
      <Footer />
      <WinningFeed />
      <Notifications />
      <MatchModal />
      <DepositModal />
    </>
  )
}
