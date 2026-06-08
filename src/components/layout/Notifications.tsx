'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'

const iconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-[#00ff88]" />,
  warning: <AlertTriangle size={18} className="text-[#ffd700]" />,
  opportunity: <TrendingUp size={18} className="text-[#00d9ff]" />,
}

export default function Notifications() {
  const { notifications, removeNotification } = useStore()

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications, removeNotification])

  return (
    <div className="fixed top-20 right-4 z-[60] space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="glass-card border border-white/10 rounded-xl p-4 flex items-start gap-3 shadow-2xl"
          >
            <div className="mt-0.5">{iconMap[n.type] || iconMap.success}</div>
            <p className="text-sm text-white/80 flex-1">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="text-white/30 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
