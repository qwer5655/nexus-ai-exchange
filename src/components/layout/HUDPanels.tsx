'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { TrendingUp, Cpu, Shield, DollarSign, BarChart3, Activity } from 'lucide-react'

const getPanels = (lang) => [
  { icon: TrendingUp, label: t('hud.liveOpps', lang), value: '1,283', change: '+12', color: '#00ff88', x: '5%', y: '25%' },
  { icon: Activity, label: t('hud.detectedMarkets', lang), value: '87,491', change: '+342', color: '#00d9ff', x: '75%', y: '20%' },
  { icon: Shield, label: t('hud.aiConfidence', lang), value: '97.3%', change: '+2.1%', color: '#00ff88', x: '8%', y: '55%' },
  { icon: BarChart3, label: t('hud.dailyProfit', lang), value: '$847K', change: '+$12.4K', color: '#ffd700', x: '78%', y: '55%' },
  { icon: Cpu, label: t('hud.onlineTraders', lang), value: '3,629', change: '+89', color: '#00d9ff', x: '5%', y: '75%' },
  { icon: DollarSign, label: t('hud.avgYield', lang), value: '3.87%', change: '+0.12%', color: '#00ff88', x: '78%', y: '75%' },
]

export default function HUDPanels() {
  const { language } = useStore()
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {getPanels(language).map((panel, i) => {
        const Icon = panel.icon
        return (
          <motion.div
            key={panel.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5 + i * 0.15, duration: 0.6 }}
            className="absolute"
            style={{ left: panel.x, top: panel.y }}
          >
            <div
              className="glass-card rounded-lg px-3 py-2 border border-white/5 min-w-[140px]"
              style={{ borderColor: panel.color + '20' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={10} style={{ color: panel.color }} />
                <span className="text-[9px] text-white/40 font-orbitron tracking-wider">{panel.label.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-orbitron font-bold" style={{ color: panel.color }}>{panel.value}</span>
                <span className="text-[9px] font-mono text-[#00ff88]/60">{panel.change}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
