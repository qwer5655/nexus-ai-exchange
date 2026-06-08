'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import { motion } from 'framer-motion'
import { HeadphonesIcon, MessageCircle, Mail, HelpCircle, FileText, BookOpen } from 'lucide-react'

const getSupportItems = (language: any) => [
  { icon: MessageCircle, name: t('support.liveChat', language), desc: t('support.liveChatDesc', language), color: '#00ff88' },
  { icon: Mail, name: t('support.email', language), desc: 'support@arbitrage.ai', color: '#00d9ff' },
  { icon: HelpCircle, name: t('support.faq', language), desc: t('support.faqDesc', language), color: '#ffd700' },
  { icon: FileText, name: t('support.docs', language), desc: t('support.docsDesc', language), color: '#00ff88' },
  { icon: BookOpen, name: t('support.apiDocs', language), desc: t('support.apiDocsDesc', language), color: '#00d9ff' },
]

export default function SupportPage() {
  const { language } = useStore()
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <HeadphonesIcon size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('support.title', language)}</span>
          </h1>
        </div>
        <p className="text-white/40 text-sm">{t('support.subtitle', language)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getSupportItems(language).map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 border border-white/5 hover:border-[#00ff88]/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: item.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-8 border border-white/5 text-center"
      >
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">{t('support.immediateHelp', language)}</h3>
        <p className="text-white/40 text-sm mb-6">{t('support.immediateHelpDesc', language)}</p>
        <button className="px-8 py-3 rounded-xl bg-[#00ff88] text-[#05070c] font-bold text-sm hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all">
          {t('support.startChat', language)}
        </button>
      </motion.div>
    </div>
  )
}
