'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

import type { WinningEntry } from '@/types'

export default function WinningFeed() {
  const { language } = useStore()
  const [entries, setEntries] = useState<WinningEntry[]>([])

  function loadFeed() { fetch('/api/public/winning-feed').then(r=>r.json()).then(d=>setEntries(d.entries||[])).catch(()=>{}) }; useEffect(() => { loadFeed(); const iv = setInterval(loadFeed, 15000); return () => clearInterval(iv) }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden h-10 pointer-events-none">
      <div className="glass-card border-t border-white/5 h-full flex items-center">
        <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full bg-[#00ff88]/5">
          <TrendingUp size={14} className="text-[#00ff88]" />
          <span className="text-xs font-orbitron text-[#00ff88] whitespace-nowrap">{t('winning.liveWinnings', language)}</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full">
          <div className="marquee-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            onMouseOver={() => {}}
            onMouseOut={() => {}}
          >
            <div className="flex items-center h-full" >
            {[...entries, ...entries].map((entry, i) => (
              <div key={i} className="flex items-center gap-3 mx-6 text-sm whitespace-nowrap">
                <span className="text-white/40 font-mono">#{entry.id}</span>
                <span className="text-white/80">{entry.user}</span>
                <span className="text-[#00ff88] font-mono">+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

