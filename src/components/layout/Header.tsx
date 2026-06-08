'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, ChevronDown, LogIn, UserPlus, Wallet, Globe } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useAuthStore } from '@/store/authStore'
import { t } from '@/lib/i18n'
import NotificationCenter from '@/components/auth/NotificationCenter'
import UserMenu from '@/components/auth/UserMenu'

var navItems = [
  { name: 'Home', href: '/', key: 'nav.home' },
  { name: 'Opportunities', href: '/opportunities', key: 'nav.opportunities' },
  { name: 'Leaderboard', href: '/leaderboard', key: 'nav.leaderboard' },
  { name: 'AI Center', href: '/ai-center', key: 'nav.aiCenter' },
  { name: 'Support', href: '/support', key: 'nav.support' },
];

var languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
];

function LanguageDropdown() {
  var { language, setLanguage } = useStore();
  var [open, setOpen] = useState(false);
  var ref = useRef<HTMLDivElement>(null);
  useEffect(function() {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);
  var current = languages.find(function(l) { return l.code === language; }) || languages[0];
  return (
    <div className='relative' ref={ref}>
      <button onClick={function() { setOpen(!open); }}
        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all'>
        <Globe size={14} className='opacity-60' />
        <span>{current.native}</span>
        <ChevronDown size={12} className={'transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className='absolute right-0 top-full mt-1.5 w-[160px] bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50'>
            {languages.map(function(l) {
              return (
                <button key={l.code} onClick={function() { setLanguage(l.code as 'en' | 'zh'); setOpen(false); }}
                  className={'w-full text-left px-3.5 py-2.5 text-xs transition-all flex items-center justify-between ' + (language === l.code ? 'text-[#00ff88] bg-[#00ff88]/5' : 'text-white/60 hover:text-white hover:bg-white/[0.03]')}>
                  <span>{l.native}</span>
                  {language === l.code && <div className='w-1.5 h-1.5 rounded-full bg-[#00ff88]' />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BalanceBadge() {
  var { user } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';
  if (!user) return null;
  return (
    <Link href='/deposit'
      className='flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group'>
      <div>
        <div className='text-[9px] text-white/30 tracking-wider'>{isZh ? '余额' : 'Balance'}</div>
        <div className='text-sm font-bold text-white/90 leading-tight'>{'$'}{user.balance.toFixed(2)}</div>
      </div>
      <div className='px-2 py-1 rounded-md bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity'>
        {isZh ? '充值' : 'Deposit'}
      </div>
    </Link>
  );
}

export default function Header() {
  var [scrolled, setScrolled] = useState(false);
  var [mobileOpen, setMobileOpen] = useState(false);
  var pathname = usePathname();
  var { language } = useStore();
  var { user, openAuthModal } = useAuthStore();
  var isZh = language === 'zh';

  useEffect(function() {
    function handleScroll() { setScrolled(window.scrollY > 40); }
    window.addEventListener('scroll', handleScroll);
    return function() { window.removeEventListener('scroll', handleScroll); };
  }, []);

  return (
    <header className={'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ' + (scrolled ? 'bg-[#0B1220]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-transparent')}>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between'>
        
        {/* === LEFT: Logo === */}
        <Link href='/' className='flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center text-[#05070c] font-bold text-sm'>N</div>
            <div className='hidden sm:block'>
              <div className='text-sm font-bold text-white tracking-wide leading-tight'>NEXUS AI</div>
              <div className='text-[8px] text-white/25 tracking-wider leading-tight'>FIFA 2026 USA &middot; CAN &middot; MEX</div>
            </div>
          </div>
        </Link>

        {/* === CENTER: Navigation === */}
        <nav className='hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2'>
          {navItems.map(function(item) {
            var isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={'relative px-4 py-2 text-sm font-medium transition-all duration-200 ' + (isActive ? 'text-white' : 'text-white/50 hover:text-white/80')}>
                {t(item.key, language)}
                {isActive && (
                  <motion.div layoutId='navIndicator'
                    className='absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#00ff88] to-[#00d9ff] rounded-full' />
                )}
              </Link>
            );
          })}
        </nav>

        {/* === RIGHT: Auth + Language === */}
        <div className='flex items-center gap-2'>
          {user ? (
            <div className='flex items-center gap-2'>
              <BalanceBadge />
              <NotificationCenter />
              <UserMenu />
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <button onClick={function() { openAuthModal('login'); }}
                className='px-3 py-1.5 text-sm text-white/60 hover:text-white/90 transition-all font-medium'>
                {isZh ? '登录' : 'Login'}
              </button>
              <button onClick={function() { openAuthModal('register'); }}
                className='px-4 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] hover:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all duration-300'>
                {isZh ? '创建账户' : 'Create Account'}
              </button>
            </div>
          )}

          <div className='w-px h-6 bg-white/[0.06] mx-1' />
          <LanguageDropdown />

          {/* Mobile hamburger */}
          <button onClick={function() { setMobileOpen(!mobileOpen); }}
            className='lg:hidden p-2 text-white/60 hover:text-white'>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className='lg:hidden bg-[#0B1220]/95 backdrop-blur-xl border-t border-white/[0.04]'>
            <div className='px-4 py-4 space-y-1'>
              {navItems.map(function(item) {
                var isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={function() { setMobileOpen(false); }}
                    className={'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ' + (isActive ? 'text-[#00ff88] bg-[#00ff88]/5 border border-[#00ff88]/10' : 'text-white/60 hover:text-white hover:bg-white/[0.03] border border-transparent')}>
                    {t(item.key, language)}
                  </Link>
                );
              })}
              <div className='border-t border-white/[0.04] my-3' />
              {user ? (
                <button onClick={function() { useAuthStore.getState().logout(); setMobileOpen(false); }}
                  className='w-full text-left px-4 py-3 text-sm text-red-400/70 hover:text-red-400 transition-all'>{isZh ? '退出登录' : 'Log Out'}</button>
              ) : (
                <div className='flex gap-2 px-4'>
                  <button onClick={function() { openAuthModal('login'); setMobileOpen(false); }}
                    className='flex-1 py-2.5 text-sm font-medium rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15] transition-all'>{isZh ? '登录' : 'Login'}</button>
                  <button onClick={function() { openAuthModal('register'); setMobileOpen(false); }}
                    className='flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] transition-all'>{isZh ? '注册' : 'Register'}</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}