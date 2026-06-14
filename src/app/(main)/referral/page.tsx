'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Copy, Check, Users, TrendingUp, Trophy, Share2, DollarSign, BarChart3, Link2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'

export default function ReferralPage() {
  var { user } = useAuthStore();
  var { language } = useStore();
  var isZh = language === 'zh';
  var [stats, setStats] = useState<any>({ totalReferrals: 0, activeReferrals: 0, totalCommission: 0, todayCommission: 0, referralCode: '', referralLink: '', rank: 0 });
  var [copied, setCopied] = useState(false);
  useEffect(function() { if (user?.userId) fetch('/api/referrals?userId=' + user.userId).then(function(r){return r.json()}).then(function(d){ setStats({ totalReferrals: d.total_referrals || 0, activeReferrals: d.active_referrals || 0, totalCommission: d.total_commission || 0, todayCommission: 0, referralCode: d.referral_code || '', referralLink: 'https://arbitrage.ai/ref/' + (d.referral_code || ''), rank: 0 }) }).catch(function(){}) }, [user?.userId])

  function copyLink() {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className='flex items-center gap-3 mb-6'>
          <Gift size={24} className='text-[#ffd700]' />
          <h1 className='text-2xl md:text-3xl font-orbitron font-bold text-gradient-primary'>{isZh ? '邀请返佣' : 'Referral Program'}</h1>
        </div>
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='glass-card rounded-xl p-6 border border-white/5'>
            <h3 className='text-lg font-orbitron font-bold text-white mb-4'>{isZh ? '我的邀请链接' : 'My Referral Link'}</h3>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex-1 p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white/60 truncate'>{stats.referralLink}</div>
              <button onClick={copyLink}
                className='flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium hover:bg-[#00ff88]/20 transition-all'>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? (isZh ? '已复制' : 'Copied') : (isZh ? '复制链接' : 'Copy Link')}
              </button>
            </div>
            <div className='p-4 rounded-xl bg-gradient-to-r from-[#ffd700]/5 to-transparent border border-[#ffd700]/10'>
              <p className='text-sm text-white/60'>{isZh ? '邀请好友注册，您将获得好友套利利润的10%作为佣金奖励！' : 'Invite friends and earn 10% commission on their arbitrage profits!'}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <div className='glass-card rounded-xl p-4 text-center'>
              <Users size={20} className='text-[#00d9ff] mx-auto mb-2' />
              <div className='text-2xl font-orbitron font-bold text-white'>{stats.totalReferrals}</div>
              <div className='text-xs text-white/40 mt-1'>{isZh ? '总邀请' : 'Total Referrals'}</div>
            </div>
            <div className='glass-card rounded-xl p-4 text-center'>
              <TrendingUp size={20} className='text-[#00ff88] mx-auto mb-2' />
              <div className='text-2xl font-orbitron font-bold text-white'>{stats.activeReferrals}</div>
              <div className='text-xs text-white/40 mt-1'>{isZh ? '活跃' : 'Active'}</div>
            </div>
            <div className='glass-card rounded-xl p-4 text-center'>
              <DollarSign size={20} className='text-[#ffd700] mx-auto mb-2' />
              <div className='text-2xl font-orbitron font-bold text-[#ffd700]'>{'$'}{stats.totalCommission.toFixed(2)}</div>
              <div className='text-xs text-white/40 mt-1'>{isZh ? '总佣金' : 'Total Commission'}</div>
            </div>
            <div className='glass-card rounded-xl p-4 text-center'>
              <Trophy size={20} className='text-[#ff6b6b] mx-auto mb-2' />
              <div className='text-2xl font-orbitron font-bold text-white'>#{stats.rank.toLocaleString()}</div>
              <div className='text-xs text-white/40 mt-1'>{isZh ? '排名' : 'Rank'}</div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className='glass-card rounded-xl p-6 border border-white/5'>
          <h3 className='text-lg font-orbitron font-bold text-white mb-4'>{isZh ? '奖励等级' : 'Reward Tiers'}</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-white/5'><span className='text-sm text-white/60'>{isZh ? '邀请 1-5 人' : 'Invite 1-5'}</span><span className='text-sm font-bold text-[#00ff88]'>5%</span></div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-white/5'><span className='text-sm text-white/60'>{isZh ? '邀请 6-20 人' : 'Invite 6-20'}</span><span className='text-sm font-bold text-[#00ff88]'>10%</span></div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-white/5'><span className='text-sm text-white/60'>{isZh ? '邀请 21-50 人' : 'Invite 21-50'}</span><span className='text-sm font-bold text-[#00ff88]'>15%</span></div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-white/5'><span className='text-sm text-white/60'>{isZh ? '邀请 50+ 人' : 'Invite 50+'}</span><span className='text-sm font-bold text-[#ffd700]'>20%</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}