'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import { motion } from 'framer-motion'
import { Newspaper, Sparkles } from 'lucide-react'
import { newsItems } from '@/data/news'

export default function NewsCenter() {
  const { language } = useStore()
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Newspaper size={24} className="text-[#00d9ff]" />
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('news.title', language)}</span>
          </h2>
        </div>
        <p className="text-white/40 text-sm">{t('news.subtitle', language)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden border border-white/5 hover:border-[#00ff88]/20 transition-all group"
          >
            <div className="h-32 bg-gradient-to-br from-[#00ff88]/5 to-[#00d9ff]/5 flex items-center justify-center">
              <Newspaper size={32} className="text-white/10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-orbitron bg-white/5 text-white/60">
                  {item.category}
                </span>
                <span className="text-[10px] text-white/30">{item.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 leading-relaxed line-clamp-2">{item.title}</h3>
              <p className="text-xs text-white/40 line-clamp-2 mb-3">{item.summary}</p>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-[#00ff88]/5">
                <Sparkles size={12} className="text-[#00ff88] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#00ff88]/80 leading-relaxed">{item.aiSummary}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
