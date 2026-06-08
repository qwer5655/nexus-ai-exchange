'use client'
import { motion } from 'framer-motion'
import { Cpu, Radar, TrendingUp, Shield, Brain, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import ProfitChart from '@/components/charts/ProfitChart'

const getAiModules = (lang: any) => [
  { icon: Radar, name: t('ai.scanner', lang), desc: t('ai.scannerDesc', lang), color: '#00ff88' },
  { icon: TrendingUp, name: t('ai.detector', lang), desc: t('ai.detectorDesc', lang), color: '#00d9ff' },
  { icon: Cpu, name: t('ai.engine', lang), desc: t('ai.engineDesc', lang), color: '#ffd700' },
  { icon: Shield, name: t('ai.riskAnalyzer', lang), desc: t('ai.riskAnalyzerDesc', lang), color: '#ff4d4f' },
  { icon: Brain, name: t('ai.prediction', lang), desc: t('ai.predictionDesc', lang), color: '#00ff88' },
  { icon: BarChart3, name: t('ai.profitOptimizer', lang), desc: t('ai.profitOptimizerDesc', lang), color: '#00d9ff' },
]

export default function AICenterDashboard() {
  const { language } = useStore()

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-2">
          <span className="text-gradient-primary">{t('ai.title', language)}</span>
        </h2>
        <p className="text-white/40 text-sm">{t('ai.subtitle', language)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getAiModules(language).map((module, i) => {
          const Icon = module.icon
          return (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-[#00ff88]/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: module.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{module.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    <span className="text-[10px] text-[#00ff88] font-orbitron">{t('ai.active', language)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{module.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20 font-mono">
                <span>{t('ai.accuracy', language)}: {(95 + Math.floor(Math.random() * 5))}%</span>
                <span>•</span>
                <span>{t('ai.latency', language)}: {(Math.random() * 100 + 20).toFixed(0)}ms</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-xl p-6 border border-white/5"
      >
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">{t('ai.profitOverview', language)}</h3>
        <ProfitChart />
      </motion.div>
    </div>
  )
}
