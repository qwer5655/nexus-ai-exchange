'use client'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  const { language } = useStore()
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* ⚽ UNITED 2026™ */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="text-2xl">⚽</span>
              <span className="text-sm md:text-base font-orbitron text-white/60 tracking-[0.3em]">UNITED 2026</span>
              <sup className="text-[9px] text-white/30 font-montserrat">TM</sup>
            </motion.div>

            {/* FIFA WORLD CUP */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight"
            >
              FIFA WORLD CUP
            </motion.h1>

            {/* USA 🇺🇸 CANADA 🇨🇦 MEXICO 🇲🇽 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-4 md:gap-8 mb-10 text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <span className="text-white/80 font-medium">USA</span>
                <span className="text-lg">🇺🇸</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/80 font-medium">CANADA</span>
                <span className="text-lg">🇨🇦</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/80 font-medium">MEXICO</span>
                <span className="text-lg">🇲🇽</span>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-48 h-px mx-auto mb-10 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            {/* NEXUS AI EXCHANGE */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5"
            >
              <span className="text-gradient-primary">NEXUS AI</span>
              <span className="text-white"> EXCHANGE</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              The World's First AI-Powered<br />
              Sports Arbitrage Marketplace
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-32 h-px mx-auto mb-10 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/deposit"
                className="group relative px-10 py-4 rounded-[14px] bg-[#00ff88] text-[#05070c] font-semibold text-base tracking-[0.04em] hover:bg-[#00ff88]/90 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.25)] overflow-hidden"
              >
                <span className="relative z-10">{t('hero.startEarning', language)}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link
                href="/opportunities"
                className="px-10 py-4 rounded-[14px] border border-white/10 bg-white/[0.02] text-white/70 font-medium text-base tracking-[0.04em] hover:border-white/20 hover:bg-white/[0.05] hover:text-white hover:-translate-y-0.5 transition-all duration-300"
              >
                {t('hero.viewLive', language)}
                <TrendingUp size={16} className="inline ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
