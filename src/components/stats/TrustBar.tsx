'use client'
import { motion } from 'framer-motion'
import { Shield, Award, Lock, CheckCircle, TrendingUp, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'

const getTrustItems = (lang) => [
  { icon: Shield, text: t('trust.item1', lang) },
  { icon: Award, text: t('trust.item2', lang) },
  { icon: Lock, text: t('trust.item3', lang) },
  { icon: CheckCircle, text: t('trust.item4', lang) },
  { icon: TrendingUp, text: t('trust.item5', lang) },
  { icon: Users, text: t('trust.item6', lang) },
]

export default function TrustBar() {
  const { language } = useStore()

  return (
    <section className="py-8 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-6 border border-white/5"
        >
          <div className="text-center mb-6">
            <h3 className="text-sm font-orbitron text-white/40 uppercase tracking-widest">
              {language === 'zh' ? '信任与安全保障' : 'Trust & Security'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getTrustItems(language).map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00ff88]/5 flex items-center justify-center">
                    <Icon size={18} className="text-[#00ff88]/60" />
                  </div>
                  <span className="text-[10px] text-white/30 leading-relaxed">{item.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
