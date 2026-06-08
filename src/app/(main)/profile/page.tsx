'use client'
import { motion } from 'framer-motion'
import { User, Copy, Share2, Award, Check, Bell, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { achievements } from '@/data/achievements'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function ProfilePage() {
  const { userBalance, userDeposits, language } = useStore()
  const [referralCopied, setReferralCopied] = useState(false)

  const referralLink = 'https://arbitrage.ai/ref/USER123'

  function copyReferral() {
    navigator.clipboard.writeText(referralLink)
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <User size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('nav.profile', language)}</span>
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center text-2xl font-bold text-[#05070c]">
                U
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">User</h2>
                <p className="text-sm text-white/40">{language === 'zh' ? '注册于' : 'Member since'} June 2026</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-orbitron font-bold text-[#00ff88]">{formatCurrency(userBalance)}</div>
                <div className="text-xs text-white/40 mt-1">{t('profile.balance', language)}</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-orbitron font-bold text-[#00d9ff]">{userDeposits.length}</div>
                <div className="text-xs text-white/40 mt-1">{t('profile.deposits', language)}</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-orbitron font-bold text-[#ffd700]">0</div>
                <div className="text-xs text-white/40 mt-1">{t('profile.trades', language)}</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-orbitron font-bold text-[#ff4d4f]">0%</div>
                <div className="text-xs text-white/40 mt-1">{t('profile.winRate', language)}</div>
              </div>
            </div>
          </div>

          {/* Referral System */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Share2 size={18} className="text-[#ffd700]" />
              <h3 className="text-lg font-orbitron font-bold text-white">{t('profile.referralProgram', language)}</h3>
            </div>
            <p className="text-sm text-white/40 mb-4">{t('profile.referralDesc', language)}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/60 truncate">
                {referralLink}
              </div>
              <button
                onClick={copyReferral}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium hover:bg-[#00ff88]/20 transition-all"
              >
                {referralCopied ? <Check size={16} /> : <Copy size={16} />}
                {referralCopied ? t('profile.copied', language) : t('profile.copy', language)}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-[#00ff88]" />
              <h3 className="text-lg font-orbitron font-bold text-white">{t('profile.securityCenter', language)}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">{t('profile.emailVerified', language)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88]">{t('profile.verified', language)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">{t('profile.twoFactor', language)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{t('profile.disabled', language)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">{t('profile.kyc', language)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{t('profile.pending', language)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {/* Achievements */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-[#ffd700]" />
              <h3 className="text-lg font-orbitron font-bold text-white">{t('profile.achievements', language)}</h3>
            </div>
            <div className="space-y-3">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 transition-all hover:bg-white/[0.08]">
                  <div className="text-xl">{a.icon}</div>
                  <div>
                    <div className="text-sm text-white/80">{t('achv.' + a.id + '_name', language)}</div>
                    <div className="text-[10px] text-white/30">{t('achv.' + a.id + '_desc', language)}</div>
                  </div>
                  <div className="ml-auto">
                    {a.unlocked ? (
                      <Check size={16} className="text-[#00ff88]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* t('profile.notifications', language) */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-[#00d9ff]" />
              <h3 className="text-lg font-orbitron font-bold text-white">{t('profile.notifications', language)}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-xs text-white/60">{t('profile.oppAlerts', language)}</span>
                <div className="w-10 h-5 rounded-full bg-[#00ff88] relative cursor-pointer">
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-xs text-white/60">{t('profile.depositConf', language)}</span>
                <div className="w-10 h-5 rounded-full bg-[#00ff88] relative cursor-pointer">
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-xs text-white/60">{t('profile.marketUpdates', language)}</span>
                <div className="w-10 h-5 rounded-full bg-white/20 relative cursor-pointer">
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
