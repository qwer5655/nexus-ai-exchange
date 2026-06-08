'use client'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'

export default function LeaderboardPage() {
  const { language } = useStore()
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={24} className="text-[#ffd700]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-gold">{t('nav.leaderboard', language)}</span>
          </h1>
        </div>
        <p className="text-white/40 text-sm">{t('leaderboard.subtitle', language)}</p>
      </motion.div>
      <LeaderboardTable />
    </div>
  )
}
