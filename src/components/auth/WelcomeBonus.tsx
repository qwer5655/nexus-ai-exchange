'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Sparkles, Coins } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

export default function WelcomeBonus() {
  var { showWelcomeBonus, setShowWelcomeBonus, user } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';

  if (!showWelcomeBonus || !user) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={function() { setShowWelcomeBonus(false); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
        className="relative bg-[#0B1220] border border-white/[0.06] rounded-2xl shadow-2xl max-w-[400px] w-full overflow-hidden"
      >
        <button onClick={function() { setShowWelcomeBonus(false); }} className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/70 z-10"><X size={18} /></button>

        <div className="relative pt-12 pb-8 px-6 text-center">
          {/* Particle effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {['🎉', '⭐', '💰', '✨', '🎊', '🔮'].map(function(e, i) {
              return (
                <motion.span key={i}
                  initial={{ opacity: 0, y: 0, x: Math.random() * 300 - 150 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -200, x: Math.random() * 300 - 150 }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  className="absolute text-lg bottom-0 left-1/2"
                >{e}</motion.span>
              );
            })}
          </div>

          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff8c00] flex items-center justify-center mx-auto mb-4"
          >
            <Gift size={36} className="text-[#05070c]" />
          </motion.div>

          <h2 className="text-2xl font-orbitron font-bold text-white mb-1">{isZh ? '🎁 欢迎奖励已激活' : '🎁 Welcome Bonus Activated'}</h2>
          <p className="text-sm text-white/40 mb-6">{isZh ? '恭喜注册成功！' : 'Congratulations on registering!'}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-[#00ff88]/5 rounded-xl border border-[#00ff88]/10">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-[#00ff88]" />
                <span className="text-xs text-white/60">{isZh ? '体验金' : 'Demo Credit'}</span>
              </div>
              <span className="text-sm font-bold text-[#00ff88]">{'$5.00'}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-[#00d9ff]/5 rounded-xl border border-[#00d9ff]/10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#00d9ff]" />
                <span className="text-xs text-white/60">{isZh ? '高级机会' : 'Premium Opportunities'}</span>
              </div>
              <span className="text-sm font-bold text-[#00d9ff]">{'x3'}</span>
            </div>
          </div>

          <button onClick={function() { setShowWelcomeBonus(false); }}
            className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm"
          >
            {isZh ? '开始套利之旅' : 'Start Arbitrage Journey'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
