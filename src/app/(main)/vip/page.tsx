'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, DollarSign, Gift, Zap, Shield, Star, TrendingUp, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'

var tiers = [
  { lv:0, en:'Explorer', zh:'\u63a2\u9669\u8005', color:'#8B8B8B', min:0, discount:'0%', bonus:'5%', signals:1, support:'Standard' },
  { lv:1, en:'Bronze', zh:'\u9752\u94dc', color:'#CD7F32', min:100, discount:'5%', bonus:'8%', signals:3, support:'Priority' },
  { lv:2, en:'Silver', zh:'\u767d\u94f6', color:'#C0C0C0', min:500, discount:'10%', bonus:'10%', signals:5, support:'Priority' },
  { lv:3, en:'Gold', zh:'\u9ec4\u91d1', color:'#FFD700', min:1000, discount:'15%', bonus:'12%', signals:10, support:'24/7 VIP' },
  { lv:4, en:'Platinum', zh:'\u94c2\u91d1', color:'#00d9ff', min:5000, discount:'20%', bonus:'15%', signals:20, support:'24/7 VIP' },
  { lv:5, en:'Legend', zh:'\u4f20\u5947', color:'#ff4d4f', min:10000, discount:'25%', bonus:'20%', signals:50, support:'Dedicated' },
];

export default function VIPPage() {
  var { user } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';
  var [sel, setSel] = useState<number>(user?.level || 1);
  var lv = user?.level || 0;
  var pct = (lv / 5) * 100;
  var tier = tiers[sel];

  function tn(t: any) { return isZh ? t.zh : t.en; }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className='flex items-center gap-3 mb-6'><Crown size={24} className='text-[#ffd700]' />
          <h1 className='text-2xl md:text-3xl font-orbitron font-bold text-gradient-primary'>{isZh ? 'VIP\u4e2d\u5fc3' : 'VIP Center'}</h1></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04] mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div><span className='text-xs text-white/30'>{isZh ? '\u5f53\u524d\u7b49\u7ea7' : 'Current Level'}</span>
            <div className='text-2xl font-orbitron font-bold mt-1' style={{ color: tiers[lv].color }}>{tn(tiers[lv])}</div></div>
          <div className='text-right'><span className='text-xs text-white/30'>{isZh ? '\u4e0b\u4e00\u7ea7' : 'Next Level'}</span>
            <div className='text-sm font-medium text-white/60 mt-1'>{tn(tiers[Math.min(lv + 1, 5)])}</div></div>
        </div>
        <div className='h-2 bg-white/[0.04] rounded-full overflow-hidden'>
          <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} className='h-full rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' /></div>
        {lv < 5 && <p className='text-[10px] text-white/20 mt-2'>{isZh ? '\u5145\u503c$' + tiers[lv + 1].min + '\u5347\u7ea7\u81f3' + tn(tiers[lv + 1]) : 'Deposit $' + tiers[lv + 1].min + ' to reach ' + tn(tiers[lv + 1])}</p>}
      </motion.div>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6'>
        {tiers.map(function(t) {
          return (
            <motion.button key={t.lv} onClick={function() { setSel(t.lv); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={'relative rounded-xl p-4 border transition-all duration-300 text-center ' + (sel === t.lv ? 'bg-white/[0.04] shadow-[0_0_12px_rgba(0,255,136,0.04)]' : 'border-white/[0.04] hover:border-white/[0.1] bg-white/[0.02]')}
              style={{ borderColor: sel === t.lv ? t.color : undefined }}>
              {t.lv === lv && <div className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center'><Check size={10} className='text-[#05070c]' /></div>}
              <div className='text-lg font-bold mb-1' style={{ color: t.color }}>{tn(t)}</div>
              <div className='text-[9px] text-white/20'>{isZh ? '\u95e8\u69db $' + t.min : 'Min $' + t.min}</div>
            </motion.button>
          );
        })}
      </div>
      <motion.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]' style={{ borderColor: tier.color + '20' }}>
        <h3 className='text-lg font-orbitron font-bold mb-4' style={{ color: tier.color }}>{tn(tier)} Benefits</h3>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><DollarSign size={18} className='text-[#00ff88] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u89e3\u9501\u6298\u6263' : 'Unlock Discount'}</div><div className='text-lg font-bold text-[#00ff88]'>{tier.discount}</div></div>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><Gift size={18} className='text-[#ffd700] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u8fd4\u4f63\u6bd4\u4f8b' : 'Referral Bonus'}</div><div className='text-lg font-bold text-[#ffd700]'>{tier.bonus}</div></div>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><Zap size={18} className='text-[#00d9ff] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u6bcf\u65e5\u4fe1\u53f7' : 'Daily Signals'}</div><div className='text-lg font-bold text-[#00d9ff]'>{tier.signals}</div></div>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><Shield size={18} className='text-[#a855f7] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u5ba2\u670d\u652f\u6301' : 'Support'}</div><div className='text-lg font-bold text-[#a855f7]'>{tier.support}</div></div>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><Star size={18} className='text-[#ff6b6b] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u4e13\u5c5e\u673a\u4f1a' : 'Exclusive Opps'}</div><div className='text-lg font-bold text-[#ff6b6b]'>{tier.signals + (isZh ? ' daily' : ' daily')}</div></div>
          <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'><TrendingUp size={18} className='text-[#ff8c00] mb-2' /><div className='text-sm text-white/70'>{isZh ? '\u6536\u76ca\u52a0\u6210' : 'Profit Boost'}</div><div className='text-lg font-bold text-[#ff8c00]'>+{tier.discount}</div></div>
        </div>
      </motion.div>
    </div>
  );
}