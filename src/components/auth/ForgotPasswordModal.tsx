'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

export default function ForgotPasswordModal() {
  var { closeAuthModal, openAuthModal } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';

  var [step, setStep] = useState<'email' | 'verify' | 'done'>('email');
  var [email, setEmail] = useState('');
  var [code, setCode] = useState('');
  var [sent, setSent] = useState(false);

  function handleSend() {
    if (!email) return;
    setSent(true);
    setTimeout(function() { setStep('verify'); }, 500);
  }

  function handleVerify() {
    if (!code) return;
    setTimeout(function() { setStep('done'); }, 500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeAuthModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[420px] bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        <button onClick={closeAuthModal} className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/70 transition-all">
          <X size={20} />
        </button>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {step === 'email' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-[#00ff88] font-orbitron text-lg font-bold">{isZh ? '找回密码' : 'Reset Password'}</div>
                <div className="text-white/40 text-xs mt-1">{isZh ? '输入注册邮箱，我们将发送验证码' : 'Enter your email to receive a verification code'}</div>
              </div>
              <div>
                <label className="text-[11px] text-white/40 mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 transition-all"
                  placeholder={isZh ? '输入注册邮箱' : 'Enter your registered email'} />
              </div>
              <button onClick={handleSend}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm"
              >
                {sent ? (isZh ? '发送中...' : 'Sending...') : (isZh ? '发送验证码' : 'Send Code')}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-[#00ff88] font-orbitron text-lg font-bold">{isZh ? '验证身份' : 'Verify Identity'}</div>
                <div className="text-white/40 text-xs mt-1">{isZh ? '验证码已发送至' : 'Code sent to'} {email}</div>
              </div>
              <div>
                <label className="text-[11px] text-white/40 mb-1.5 block">{isZh ? '验证码' : 'Verification Code'}</label>
                <input type="text" value={code} onChange={function(e) { setCode(e.target.value); }}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 transition-all tracking-[8px] text-center font-mono text-lg"
                  placeholder="000000" maxLength={6} />
              </div>
              <button onClick={handleVerify}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm"
              >
                {isZh ? '验证' : 'Verify'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle size={32} className="text-[#05070c]" />
              </motion.div>
              <h3 className="text-lg font-orbitron font-bold text-white mb-2">{isZh ? '密码已重置' : 'Password Reset'}</h3>
              <p className="text-xs text-white/40 mb-6">{isZh ? '请检查邮箱获取新密码' : 'Check your email for the new password'}</p>
              <button onClick={function() { openAuthModal('login'); }}
                className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm"
              >
                {isZh ? '返回登录' : 'Back to Login'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
