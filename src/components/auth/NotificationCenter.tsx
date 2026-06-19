'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck, TrendingUp, Banknote, Gift } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

var mockNotifs = [
  { id: 'm1', title: 'New Opportunity Unlocked', description: 'Canada vs Costa Rica report is now available', time: '2 min ago', icon: '📈', read: false },
  { id: 'm2', title: 'Deposit Approved', description: 'Your 100 USDT deposit has been approved', time: '15 min ago', icon: '💰', read: false },
  { id: 'm3', title: 'Welcome Bonus', description: '5 USDT demo credit has been added to your account', time: '1 hour ago', icon: '🎁', read: false },
]

export default function NotificationCenter() {
  var { user, notifications, markNotificationRead, clearNotifications } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';
  var [open, setOpen] = useState(false);
  var ref = useRef<HTMLDivElement>(null);
  // Use mock if store has no notifications
  var displayNotifs = notifications.length > 0 ? notifications : mockNotifs

  useEffect(function() {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);

  if (!user) return null;

  var unread = displayNotifs.filter(function(n: any) { return !n.read; }).length;

  return (
    <div className='relative' ref={ref}>
      <button onClick={function() { setOpen(!open); }} className='relative p-2 text-white/40 hover:text-white transition-all'>
        <Bell size={18} />
        {unread > 0 && <span className='absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff4d4f] text-[8px] font-bold text-white flex items-center justify-center'>{unread > 9 ? '9+' : unread}</span>}
      </button>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className='absolute right-0 top-full mt-2 w-[340px] bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50'>
          <div className='flex items-center justify-between p-4 border-b border-white/[0.04]'>
            <h3 className='text-sm font-semibold text-white'>{isZh ? '通知' : 'Notifications'}</h3>
            {displayNotifs.length > 0 && <button onClick={function() { clearNotifications(); }} className='flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-all'><CheckCheck size={12} />{isZh ? '全部已读' : 'Mark all read'}</button>}
          </div>
          <div className='max-h-[320px] overflow-y-auto'>
            {displayNotifs.length === 0 ? <div className='text-center py-8'><Bell size={24} className='mx-auto text-white/10 mb-2' /><p className='text-xs text-white/20'>{isZh ? '暂无通知' : 'No notifications'}</p></div>
            : displayNotifs.map(function(n: any) {
              return <button key={n.id} onClick={function() { markNotificationRead(n.id); }}
                className={'w-full text-left flex items-start gap-3 px-4 py-3 transition-all hover:bg-white/[0.02] ' + (n.read ? '' : 'bg-[#00ff88]/[0.02]')}>
                <span className='text-lg flex-shrink-0'>{n.icon}</span>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs font-medium text-white/80'>{n.title}</div>
                  <div className='text-[10px] text-white/30 mt-0.5'>{n.description}</div>
                  <div className='text-[9px] text-white/20 mt-1'>{n.time}</div>
                </div>
                {!n.read && <div className='w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5 flex-shrink-0' />}
              </button>
            })}
          </div>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}