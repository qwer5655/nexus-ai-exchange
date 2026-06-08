'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const groupTeams: Record<string, string[]> = {
  A: ['Brazil', 'Argentina', 'Uruguay', 'Colombia'],
  B: ['Germany', 'France', 'Croatia', 'Denmark'],
  C: ['England', 'Spain', 'Switzerland', 'Poland'],
  D: ['Portugal', 'Netherlands', 'Serbia', 'Czech Republic'],
  E: ['Italy', 'Belgium', 'Nigeria', 'Egypt'],
  F: ['USA', 'Mexico', 'Canada', 'Costa Rica'],
  G: ['Japan', 'South Korea', 'Australia', 'Iran'],
  H: ['Morocco', 'Senegal', 'Tunisia', 'Algeria'],
}

export default function ScheduleBracket() {
  const { language } = useStore()
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Calendar size={24} className="text-[#00ff88]" />
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('schedule.title', language)}</span>
          </h2>
        </div>
        <p className="text-white/40 text-sm">{t('schedule.subtitle', language)}</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {groups.map((group) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groups.indexOf(group) * 0.05 }}
            className="glass-card rounded-xl p-4 border border-white/5"
          >
            <h3 className="font-orbitron text-[#00d9ff] text-sm font-bold mb-3">Group {group}</h3>
            <div className="space-y-1">
              {groupTeams[group].map((team, i) => (
                <div key={team} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5">
                  <span className="text-white/80 text-xs">{team}</span>
                  <span className="text-white/20 text-[10px] font-mono">P{i + 1}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-xl p-6 border border-white/5"
      >
        <h3 className="font-orbitron text-sm font-bold text-gradient-gold mb-6 text-center">{t('schedule.knockoutStage', language)}</h3>
        <div className="flex flex-col items-center gap-4">
          {[{k:'scheduleRounds.round32'},{k:'scheduleRounds.round16'},{k:'scheduleRounds.quarterFinals'},{k:'scheduleRounds.semiFinals'},{k:'scheduleRounds.final'}].map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div
                className={
                  'w-3 h-3 rounded-full ' +
                  (i === 4 ? 'bg-[#ffd700]' : 'bg-white/20')
                }
              />
              <div className="glass-card px-6 py-2 rounded-lg text-sm">
                <span className="text-white/60">{t(s.k, language)}</span>
                <span className="text-white/20 mx-2">|</span>
                <span className="text-white/40 font-mono text-xs">{['Jul 12', 'Jul 16', 'Jul 20', 'Jul 24', 'Jul 28'][i]}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
