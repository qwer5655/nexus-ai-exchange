'use client'
import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

export default function OpportunityLocked() {
  var { openAuthModal } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={function() { openAuthModal('register'); }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl max-w-[380px] w-full p-6 text-center shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff8c00] flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-[#05070c]" />
        </div>
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">{isZh ? '🔒 机会已锁定' : '🔒 Opportunity Locked'}</h3>
        <p className="text-sm text-white/40 mb-6">{isZh ? '创建免费账户以继续查看完整内容' : 'Create a free account to continue viewing full details'}</p>
        <button onClick={function() { openAuthModal('register'); }}
          className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm mb-2"
        >
          {isZh ? '立即注册' : 'Register Now'}
        </button>
        <button onClick={function() { openAuthModal('login'); }}
          className="w-full py-2.5 text-sm text-white/40 hover:text-white/70 transition-all"
        >
          {isZh ? '已有账户？登录' : 'Already have an account? Log In'}
        </button>
      </motion.div>
    </div>
  );
}
