'use client'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import OpportunityTable from '@/components/opportunities/OpportunityTable'

export default function OpportunitiesPage() {
  const { language } = useStore()
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">
            <span className="text-gradient-primary">{t('nav.opportunities', language)}</span>
          </h1>
        </div>
        <p className="text-white/40 text-sm">{t('opportunities.subtitle', language)}</p>
      </motion.div>
      <OpportunityTable />
    </div>
  )
}
