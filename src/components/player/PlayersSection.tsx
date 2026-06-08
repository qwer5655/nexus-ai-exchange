'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PlayerImage from './PlayerImage'
import { players } from '@/data/players'

export default function PlayersSection() {
  const { language } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-16 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
              <span className="text-gradient-primary">{t('players.title', language)}</span>
            </h2>
            <p className="text-white/40 text-sm mt-1">{t('players.subtitle', language)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 rounded-lg glass-card hover:bg-white/10 transition-all">
              <ChevronLeft size={20} className="text-white/60" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 rounded-lg glass-card hover:bg-white/10 transition-all">
              <ChevronRight size={20} className="text-white/60" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 min-w-[220px] flex-shrink-0 hover:border-[#00ff88]/30 transition-all group"
            >
              <div className="relative w-full aspect-[3/4] rounded-lg bg-gradient-to-br from-[#00ff88]/5 to-[#00d9ff]/5 mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayerImage country={player.flag} size="sm" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#05070c]/80 text-xs font-orbitron text-[#00ff88]">
                  #{player.id}
                </div>
              </div>
              <h3 className="text-white font-semibold text-sm">{player.name}</h3>
              <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                <span>{player.flag}</span>
                <span>{player.country}</span>
                <span className="ml-auto">{player.position}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div>
                  <div className="text-[#ffd700] font-orbitron text-sm font-bold">{player.goals}</div>
                  <div className="text-[10px] text-white/30">{t('players.goals', language)}</div>
                </div>
                <div>
                  <div className="text-[#00d9ff] font-orbitron text-sm font-bold">{player.marketPopularity}%</div>
                  <div className="text-[10px] text-white/30">{t('players.popularity', language)}</div>
                </div>
                <div>
                  <div className="text-[#00ff88] font-orbitron text-sm font-bold">{player.aiScore}</div>
                  <div className="text-[10px] text-white/30">{t('players.aiScore', language)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
