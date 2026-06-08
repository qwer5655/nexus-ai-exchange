'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'

function CountUp({ end, duration = 2, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          let start = 0
          const increment = end / (duration * 60)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref} className="font-orbitron text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

export default function LiveStats() {
  const { stats, language } = useStore()

  const statItems = [
    { label: t('stats.todayOpps', language), value: stats.todayOpportunities },
    { label: t('stats.onlineTraders', language), value: stats.onlineTraders },
    { label: t('stats.detectedMarkets', language), value: stats.detectedMarkets },
    { label: t('stats.theoreticalProfit', language), value: stats.theoreticalProfit, prefix: '$' },
    { label: t('stats.averageYield', language), value: stats.averageYield, suffix: '%' },
    { label: t('stats.countriesConnected', language), value: stats.countriesConnected },
  ]

  return (
    <section className="py-16 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('stats.title', language)}</span>
          </h2>
          <p className="text-white/40 text-sm mt-2">{t('stats.subtitle', language)}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 text-center hover:border-[#00ff88]/20 transition-all"
            >
              <CountUp end={item.value} prefix={(item as any).prefix || ''} suffix={(item as any).suffix || ''} />
              <div className="text-xs text-white/40 mt-2 font-montserrat">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
