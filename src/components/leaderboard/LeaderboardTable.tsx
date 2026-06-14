'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-[#ffd700]" />
  if (rank === 2) return <Trophy size={18} className="text-[#c0c0c0]" />
  if (rank === 3) return <Trophy size={18} className="text-[#cd7f32]" />
  return <span className="text-white/30 font-mono text-sm w-[18px] text-center">{rank}</span>
}

export default function LeaderboardTable() {
  const { language } = useStore()
  var [topUsers, setTopUsers] = useState<any[]>([])
  useEffect(function() { fetch('/api/public/leaderboard').then(function(r){return r.json()}).then(function(d){setTopUsers((d.leaderboard||[]).slice(0,10))}).catch(function(){}) }, [])

  return (
    <section className="py-16 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
              <span className="text-gradient-gold">{t('leaderboard.title', language)}</span>
            </h2>
            <Award size={24} className="text-[#ffd700]" />
          </div>
          <p className="text-white/40 text-sm">{t('leaderboard.subtitle', language)}</p>
        </motion.div>

        <div className="glass-card rounded-xl overflow-hidden border border-white/5 max-w-3xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs text-white/40 font-orbitron">{t('leaderboard.rank', language)}</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 font-orbitron">{t('leaderboard.user', language)}</th>
                  <th className="px-4 py-3 text-right text-xs text-white/40 font-orbitron">{t('leaderboard.totalProfit', language)}</th>
                  <th className="px-4 py-3 text-right text-xs text-white/40 font-orbitron">{t('leaderboard.today', language)}</th>
                  <th className="px-4 py-3 text-right text-xs text-white/40 font-orbitron">{t('leaderboard.winRate', language)}</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-[30px]">
                        <RankBadge rank={user.rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full bg-white/5"
                        />
                        <div>
                          <div className="text-white font-medium text-sm">{user.name}</div>
                          <div className="text-xs">{user.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[#00ff88] font-mono font-bold">{formatCurrency(user.totalProfit)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp size={12} className="text-[#00ff88]" />
                        <span className="text-[#00ff88] font-mono">{formatCurrency(user.todayProfit)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-[#00d9ff]" style={{ width: user.winRate + '%' }} />
                        </div>
                        <span className="text-[#00d9ff] font-mono text-xs">{user.winRate}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
