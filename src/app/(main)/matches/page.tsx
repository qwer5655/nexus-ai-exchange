'use client'
import { useStore } from '@/store/useStore'
import { t, translateTeam, translateCompetition } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
// Data fetching via useMatches hook
import { useMatches } from '@/lib/data/hooks'

function StatusIndicator({ status, language }: { status: string; language: string }) {
  if (status === 'live') return <span className="px-2 py-0.5 rounded-full text-[10px] font-orbitron bg-[#ff4d4f]/20 text-[#ff4d4f] border border-[#ff4d4f]/30">{t('matches.live', language as any)}</span>
  if (status === 'upcoming') return <span className="px-2 py-0.5 rounded-full text-[10px] font-orbitron bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20">{t('matches.upcoming', language as any)}</span>
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-orbitron bg-white/5 text-white/40">{t('matches.finished', language as any)}</span>
}

export default function MatchesPage() {
  const { language } = useStore()
  var { data: matches, isLoading: loading, error: queryError } = useMatches()
  var error = queryError ? 'Failed to load matches' : ''
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('matches.title', language as any)}</span>
          </h1>
        </div>
        <p className="text-white/40 text-sm">{t('matches.subtitle', language as any)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(matches || []).map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5 border border-white/5 hover:border-[#00ff88]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-mono">{translateCompetition(match.competition, language)}</span>
              <StatusIndicator status={match.status} language={language} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center">
                <div className="text-white font-semibold">{translateTeam(match.homeTeam, language)}</div>
              </div>
              <div className="px-6">
                <div className="text-2xl font-orbitron font-bold text-[#00ff88]">{match.score || 'vs'}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-white font-semibold">{translateTeam(match.awayTeam, language)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{match.time === 'Live' ? t('matches.live', language as any) : match.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>USA</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
