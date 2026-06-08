'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Coins, Star, Award, Gift, Settings, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'
import Link from 'next/link'

export default function UserMenu() {
  var { user, logout } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';
  var [open, setOpen] = useState(false);
  var menuRef = useRef<HTMLDivElement>(null);

  useEffect(function() {
    function handleClick(e: any) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);

  if (!user) return null;

  var levelColors = { 1: '#8B8B8B', 2: '#52c41a', 3: '#00d9ff', 4: '#ffd700', 5: '#ff4d4f' };
  var levelNames = isZh ? ['', '探险家', '交易者', '专业型', '精英', '传奇'] : ['', 'Explorer', 'Trader', 'Professional', 'Elite', 'Legend'];

  var menuItems = [
    { label: isZh ? '个人中心' : 'Profile', icon: User, href: '/profile' },
    { label: isZh ? '充值中心' : 'Deposit Center', icon: Coins, href: '/deposit' },
    { label: isZh ? '我的机会' : 'My Opportunities', icon: Star, href: '/my-opportunities' },
    { label: isZh ? '邀请返佣' : 'Referral Program', icon: Gift, href: '/referral' },
  ];

  var initial = (user.username || 'U')[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={function() { setOpen(!open); }}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center overflow-hidden border border-white/10 relative">
          <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-xs font-bold text-[#05070c] absolute inset-0 flex items-center justify-center">{initial}</span>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-medium text-white/80 leading-tight">{user.username}</div>
          <div className="text-[9px] text-white/30 leading-tight">{'$'}{user.balance.toFixed(2)}</div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-[280px] bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center overflow-hidden relative">
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-sm font-bold text-[#05070c] absolute inset-0 flex items-center justify-center">{initial}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user.username}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: levelColors[user.level] + '20', color: levelColors[user.level] }}>{'Lv.'}{user.level}</span>
                    <span className="text-[9px] text-white/40">{levelNames[user.level]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-xl">
                <span className="text-[10px] text-white/40">{isZh ? '余额' : 'Balance'}</span>
                <span className="text-sm font-bold text-[#00ff88]">{'$'}{user.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-2">
              {menuItems.map(function(item) {
                var Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={function() { setOpen(false); }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/[0.04] hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-white/30" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/[0.04] p-2">
              <button onClick={function() { logout(); setOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:bg-red-400/5 hover:text-red-400 transition-all"
              >
                <LogOut size={16} />
                {isZh ? '退出登录' : 'Log Out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
