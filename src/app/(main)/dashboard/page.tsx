'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, DollarSign, Award, Gift, Star, Clock, Activity, BarChart3, ArrowUpRight, Zap, Shield, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import Link from 'next/link'

export default function DashboardPage() {
  var { user } = useAuthStore() as any;
  var { language } = useStore();
  var isZh = language === 'zh';
  var [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  if (!user) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Wallet size={48} className='mx-auto text-white/10 mb-4' />
          <h2 className='text-xl font-orbitron font-bold text-white/60 mb-2'>{isZh ? '请先登录' : 'Please Log In'}</h2>
          <p className='text-sm text-white/30 mb-6'>{isZh ? '登录后查看您的交易面板' : 'Log in to view your trading dashboard'}</p>
          <button onClick={function() { (useAuthStore as any).getState().openAuthModal('login'); }}
            className='px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all'>{isZh ? '登录' : 'Log In'}</button>
        </div>
      </div>
    );
  }

  var stats = [
<<<<<<< Updated upstream
    { label: isZh ? '总余额' : 'Total Balance', value: '$' + user.balance.toFixed(2), change: '+$0.00', icon: Wallet, color: '#00ff88' },
    { label: isZh ? '今日收益' : "Today's Profit", value: '$0.00', change: '+0%', icon: TrendingUp, color: '#00d9ff' },
    { label: isZh ? '总收益' : 'Total Profit', value: '$' + user.totalProfit.toFixed(2), change: '+' + user.winRate + '% win rate', icon: DollarSign, color: '#ffd700' },
    { label: isZh ? 'VIP 等级' : 'VIP Level', value: 'VIP ' + (user.level || 0), change: isZh ? '下一级: $1,000' : 'Next: $1,000', icon: Award, color: '#a855f7' },
    { label: isZh ? '邀请收益' : 'Referral Earnings', value: '$47.85', change: '+$3.20 ' + (isZh ? '今日' : 'today'), icon: Gift, color: '#ff6b6b' },
=======
    { label: isZh ? '总余额' : 'Total Balance', value: formatCurrency(summary.balance), change: '', icon: Wallet, color: '#00ff88' },
    { label: isZh ? '今日收益' : "Today's Profit", value: formatCurrency(summary.totalProfit), change: '+' + summary.profitPercent.toFixed(1) + '%', icon: TrendingUp, color: '#00d9ff' },
    { label: isZh ? '总收益' : 'Total Profit', value: formatCurrency(summary.totalProfit), change: '+' + (user?.winRate ?? 0) + '% win rate', icon: DollarSign, color: '#ffd700' },
    { label: isZh ? 'VIP 等级' : 'VIP Level', value: 'VIP ' + summary.vipLevel, change: isZh ? '下一级: $1,000' : 'Next: $1,000', icon: Award, color: '#a855f7' },
    { label: isZh ? '邀请收益' : 'Referral Earnings', value: '$0.00', change: '', icon: Gift, color: '#ff6b6b' },
>>>>>>> Stashed changes
    { label: isZh ? '已解锁机会' : 'Unlocked Opps', value: '0', change: '3 ' + (isZh ? '待解锁' : 'pending'), icon: Zap, color: '#06b6d4' },
  ];

  var recentActivity = [
    { type: 'welcome', text: isZh ? '加入 NEXUS AI Exchange' : 'Joined NEXUS AI Exchange', time: user.registerDate || 'Today', icon: '🎉', color: '#00ff88' },
    { type: 'deposit', text: isZh ? '账户创建获得 $5 体验金' : 'Received $5 welcome bonus', time: user.registerDate || 'Today', icon: '💰', color: '#ffd700' },
  ];

  var summaryData = [
    { label: isZh ? '总交易' : 'Total Trades', value: user.tradeCount || 0 },
    { label: isZh ? '充值次数' : 'Deposits', value: user.totalDeposits || 0 },
    { label: isZh ? '胜率' : 'Win Rate', value: user.winRate + '%' },
    { label: isZh ? '等级' : 'Level', value: 'Lv.' + user.level },
  ];

  return (
    <div className='space-y-6'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl md:text-3xl font-orbitron font-bold'>
              <span className='text-gradient-primary'>{isZh ? '您好' : 'Welcome back'}, {user.username}</span>
            </h1>
            <p className='text-sm text-white/30 mt-1'>{isZh ? '最后登录' : 'Last login'}: {new Date().toLocaleDateString()}</p>
          </div>
          <Link href='/deposit'
            className='hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all'>
            <Wallet size={16} />
            {isZh ? '充值' : 'Deposit'}
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
        {stats.map(function(s, i) {
          var Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}
              className='bg-[#141C2F]/80 rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all group'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='p-1.5 rounded-lg bg-white/[0.03]'>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <span className='text-[10px] text-white/30 tracking-wide'>{s.label}</span>
              </div>
              <div className='text-lg font-orbitron font-bold text-white/90 mb-0.5'>{s.value}</div>
              <div className='text-[10px]' style={{ color: s.color + '80' }}>{s.change}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart + Summary Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className='lg:col-span-2 bg-[#141C2F]/80 rounded-xl p-5 border border-white/[0.04]'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-sm font-medium text-white/70'>{isZh ? '收益图表' : 'Profit Chart'}</h3>
            <div className='flex gap-1'>
              {[['7d','7D'],['30d','30D'],['90d','90D'],['all',isZh ? '全部' : 'ALL']].map(function(p) {
                return (
                  <button key={p[0]} onClick={function() { setChartPeriod(p[0] as any); }}
                    className={'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ' + (chartPeriod === p[0] ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/30 hover:text-white/60')}>
                    {p[1]}</button>
                );
              })}
            </div>
          </div>
          <div className='h-[200px] flex items-end justify-between gap-1 px-2'>
            {Array.from({ length: 30 }, function(_, i) {
              var h = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 30;
              var gradient = i > 20 ? 'from-[#00ff88] to-[#00d9ff]' : 'from-[#00ff88]/40 to-[#00d9ff]/40';
              return (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.02 }}
                  className={'flex-1 rounded-t-sm bg-gradient-to-t ' + gradient + ' min-w-[6px]'}
                  style={{ height: h + 'px', opacity: 0.3 + (h / 100) * 0.7 }} />
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className='bg-[#141C2F]/80 rounded-xl p-5 border border-white/[0.04]'>
          <h3 className='text-sm font-medium text-white/70 mb-4'>{isZh ? '交易概览' : 'Trading Summary'}</h3>
          <div className='space-y-3'>
            {summaryData.map(function(d, i) {
              return (
                <div key={i} className='flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]'>
                  <span className='text-xs text-white/50'>{d.label}</span>
                  <span className='text-sm font-semibold text-white/80'>{d.value}</span>
                </div>
              );
            })}
          </div>
          <div className='mt-4 pt-4 border-t border-white/[0.04]'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-white/30'>{isZh ? 'VIP 进度' : 'VIP Progress'}</span>
              <span className='text-[#ffd700]'>VIP {user.level || 0} → VIP {Math.min((user.level || 0) + 1, 5)}</span>
            </div>
            <div className='mt-2 h-1.5 bg-white/[0.04] rounded-full overflow-hidden'>
              <div className='h-full w-[15%] bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded-full' />
            </div>
            <p className='text-[10px] text-white/20 mt-1'>{isZh ? '充值 $1,000 升级至下一级' : 'Deposit $1,000 to reach next level'}</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className='bg-[#141C2F]/80 rounded-xl p-5 border border-white/[0.04]'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-medium text-white/70'>{isZh ? '最近动态' : 'Recent Activity'}</h3>
          <Activity size={16} className='text-white/20' />
        </div>
        <div className='space-y-2'>
          {recentActivity.map(function(a, i) {
            return (
              <div key={i} className='flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-all'>
                <span className='text-lg'>{a.icon}</span>
                <div className='flex-1'>
                  <div className='text-sm text-white/70'>{a.text}</div>
                  <div className='text-[10px] text-white/20'>{a.time}</div>
                </div>
                <ChevronRight size={14} className='text-white/10' />
              </div>
            );
          })}
          {recentActivity.length === 0 && (
            <div className='text-center py-8'><p className='text-xs text-white/20'>{isZh ? '暂无动态' : 'No activity yet'}</p></div>
          )}
        </div>
      </motion.div>
    </div>
  );
}