'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

export default function LoginModal() {
  var { login, closeAuthModal, openAuthModal } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';

  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [showPw, setShowPw] = useState(false);
  var [remember, setRemember] = useState(true);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');

  async function handleSubmit(e: any) {
    if (!email || !password) { setError(isZh ? '请填写邮箱和密码' : 'Please enter email and password'); return }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      setLoading(false);
    } catch(e: any) {
      setError(e.message || (isZh ? '登录失败' : 'Login failed'));
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeAuthModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[460px] bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <button onClick={closeAuthModal} className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/70 transition-all">
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="text-[#00ff88] font-orbitron text-lg font-bold tracking-wider">NEXUS AI EXCHANGE</div>
            <div className="text-white/40 text-xs mt-1">{isZh ? '登录您的账户' : 'Log in to your account'}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-white/40 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 transition-all"
                  placeholder={isZh ? '输入邮箱' : 'Enter your email'} autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/40 mb-1.5 block">{isZh ? '密码' : 'Password'}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 transition-all"
                  placeholder={isZh ? '输入密码' : 'Enter password'} autoComplete="current-password" />
                <button type="button" onClick={function() { setShowPw(!showPw); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={function(e) { setRemember(e.target.checked); }} className="accent-[#00ff88]" />
                <span className="text-[11px] text-white/40">{isZh ? '记住我' : 'Remember Me'}</span>
              </label>
              <button type="button" onClick={function() { openAuthModal('forgot'); }} className="text-[11px] text-[#00ff88]/60 hover:text-[#00ff88] transition-all">
                {isZh ? '忘记密码？' : 'Forgot Password?'}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className={'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ' +
                (loading ? 'bg-white/[0.06] text-white/30' : 'bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-[0.98]')}
            >
              {loading ? (isZh ? '登录中...' : 'Logging In...') : (isZh ? '登录' : 'Log In')}
            </button>

            <p className="text-center text-[11px] text-white/30 mt-4">
              {isZh ? '还没有账户？' : "Don't have an account? "}
              <button type="button" onClick={function() { openAuthModal('register'); }} className="text-[#00ff88]/80 hover:text-[#00ff88] font-medium">{isZh ? '注册' : 'Register'}</button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

