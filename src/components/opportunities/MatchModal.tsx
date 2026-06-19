'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, TrendingUp, Shield, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { formatCurrency, formatPercent, getRiskColor, getConfidenceColor } from '@/lib/utils'

export default function MatchModal() {
  const { showMatchModal, setShowMatchModal, selectedOpportunity: opp, setShowDepositModal, language } = useStore()

  if (!opp) return null

  return (
    <AnimatePresence>
      {showMatchModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            onClick={() => setShowMatchModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl w-full z-[71] overflow-auto"
          >
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{opp.match}</h3>
                  <p className="text-sm text-white/40">{opp.competition}</p>
                </div>
                <button onClick={() => setShowMatchModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#00ff88] font-orbitron text-2xl font-bold">{formatPercent(opp.yield)}</div>
                  <div className="text-xs text-white/40 mt-1">{t('modal.yield', language)}</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#00ff88] font-orbitron text-2xl font-bold">{formatCurrency(opp.profit)}</div>
                  <div className="text-xs text-white/40 mt-1">{t('modal.expectedProfit', language)}</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#00d9ff] font-orbitron text-2xl font-bold">{opp.aiConfidence}%</div>
                  <div className="text-xs text-white/40 mt-1">{t('modal.aiConfidence', language)}</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="font-orbitron text-2xl font-bold" style={{ color: getRiskColor(opp.riskScore) }}>{opp.riskScore}/10</div>
                  <div className="text-xs text-white/40 mt-1">{t('modal.riskScore', language)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                    <DollarSign size={14} />
                    Capital Needed
                  </div>
                  <div className="font-mono text-white font-semibold">{formatCurrency(opp.requiredCapital)}</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                    <Clock size={14} />
                    Remaining Volume
                  </div>
                  <div className="font-mono text-white font-semibold">{formatCurrency(opp.availableVolume)}</div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-white mb-4">{t('modal.arbitrageRoute', language)}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="text-sm text-white font-medium">{opp.bookmakerA.name}</div>
                      <div className="text-xs text-white/40">Odds: {opp.bookmakerA.odds.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white font-mono">{formatCurrency(opp.bookmakerA.stake)}</div>
                      <div className="text-xs text-white/40">{t('modal.stake', language)}</div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ArrowUpDownIcon />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="text-sm text-white font-medium">{opp.bookmakerB.name}</div>
                      <div className="text-xs text-white/40">Odds: {opp.bookmakerB.odds.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white font-mono">{formatCurrency(opp.bookmakerB.stake)}</div>
                      <div className="text-xs text-white/40">Stake</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-[#00d9ff]/5 backdrop-blur-sm" />
                <div className="relative p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                      <Lock size={24} className="text-[#00ff88]" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{t('modal.unlockPlan', language)}</h4>
                  <p className="text-sm text-white/40 mb-4">{t('modal.depositRequired', language)}</p>
                  <button
                    onClick={() => { setShowMatchModal(false); setShowDepositModal(true) }}
                    className="px-8 py-3 rounded-xl bg-[#00ff88] text-[#05070c] font-bold hover:bg-[#00ff88]/90 transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                  >
                    Deposit & Unlock
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ArrowUpDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00ff88]">
      <path d="M7 17V7M7 7L3 11M7 7L11 11" />
      <path d="M17 7V17M17 17L21 13M17 17L13 13" />
    </svg>
  )
}
