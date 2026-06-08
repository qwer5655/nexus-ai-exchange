'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, TrendingUp, DollarSign, Shield, Zap, BarChart3, Clock, Lock, Unlock, Check, AlertTriangle, Star, Target, ChevronRight, Sparkles, Coins, LineChart } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getOpportunities } from '@/services/opportunity.service'
import { useStore } from '@/store/useStore'
import { checkUnlocked, unlockOpportunity } from '@/services/unlock.service'
import { t } from '@/lib/i18n'
import type { Opportunity } from '@/types'

export default function OpportunityDetailPage() {
  var params = useParams();
  var router = useRouter();
  var { user, openAuthModal } = useAuthStore() as any;
  var { language, opportunities } = useStore();
  var isZh = language === 'zh';
  var [unlocked, setUnlocked] = useState(false);
  var [unlockError, setUnlockError] = useState('');
  var [unlockLoading, setUnlockLoading] = useState(false);

  const [opp, setOpp] = useState<Opportunity | null>(null)
  useEffect(function() {
    getOpportunities({ page: 1, limit: 100 }).then(function(result) {
      var found = result.data.find(function(o) { return o.id === params.id; })
      if (found) setOpp(found)
    })
  }, [params.id])

  if (!opp) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle size={48} className='mx-auto text-white/10 mb-4' />
          <h2 className='text-xl font-orbitron font-bold text-white/60 mb-2'>{isZh ? '机会未找到' : 'Opportunity Not Found'}</h2>
          <Link href='/opportunities' className='text-sm text-[#00ff88]/60 hover:text-[#00ff88] transition-all'>{isZh ? '返回机会列表' : 'Back to opportunities'}</Link>
        </div>
      </div>
    );
  }

  var isLocked = !unlocked;

  function handleUnlock() {
    if (!user) { openAuthModal('register'); return }
    setUnlockLoading(true); setUnlockError('')
    unlockOpportunity(user.userId, params.id as string, opp?.requiredCapital || 10)
      .then(function() { setUnlocked(true); setUnlockLoading(false) })
      .catch(function(e: any) { setUnlockError(e.message); setUnlockLoading(false) })
  }

  var aiAnalysis = [
    { label: 'AI ' + (isZh ? '置信度' : 'Confidence'), value: (opp.aiConfidence * 100).toFixed(1) + '%', score: opp.aiConfidence, color: opp.aiConfidence > 0.85 ? '#00ff88' : opp.aiConfidence > 0.7 ? '#ffd700' : '#ff6b6b' },
    { label: isZh ? '风险评分' : 'Risk Score', value: opp.riskScore + '/10', score: 1 - opp.riskScore / 10, color: opp.riskScore <= 3 ? '#00ff88' : opp.riskScore <= 6 ? '#ffd700' : '#ff6b6b' },
    { label: isZh ? '市场信号' : 'Market Signal', value: opp.status === 'HOT' ? (isZh ? '强烈买入' : 'Strong Buy') : opp.status === 'EXCLUSIVE' ? (isZh ? '独家信号' : 'Exclusive') : (isZh ? '中等' : 'Moderate'), score: opp.status === 'HOT' ? 0.9 : opp.status === 'EXCLUSIVE' ? 0.95 : 0.6, color: '#00d9ff' },
  ];

  var historicalData = [
    { label: isZh ? '30天相似机会' : '30d Similar', winRate: '87%', avgProfit: '+5.2%', samples: 124 },
    { label: isZh ? '7天相似机会' : '7d Similar', winRate: '92%', avgProfit: '+4.8%', samples: 43 },
    { label: isZh ? '同联赛历史' : 'Same League', winRate: '83%', avgProfit: '+3.9%', samples: 312 },
  ];

  return (
    <div>
      {/* Back */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mb-4'>
        <button onClick={function() { router.back(); }}
          className='flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-all'>
          <ArrowLeft size={16} />
          {isZh ? '返回' : 'Back'}</button>
      </motion.div>

      {/* Match Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04] mb-5'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88]'>{opp.competition}</span>
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-[#ffd700]/10 text-[#ffd700] ml-2'>{opp.status}</span>
              {unlocked && <span className='text-[10px] px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] ml-2'>{isZh ? '已解锁' : 'Unlocked'} ✓</span>}
          </div>
          <div className='text-right'>
            <div className='text-2xl font-orbitron font-bold text-[#00ff88]'>+{opp.yield.toFixed(2)}%</div>
            <div className='text-[10px] text-white/30'>{isZh ? '预计收益率' : 'Expected Yield'}</div>
          </div>
        </div>
        <div className='flex items-center justify-center gap-6 py-6'>
          <div className='text-center'>
            <div className='text-lg font-bold text-white/90'>{opp.homeTeam}</div>
            <div className='text-[10px] text-white/30 mt-1'>{isZh ? '主队' : 'Home'}</div>
          </div>
          <div className='text-3xl font-orbitron font-bold text-white/20'>VS</div>
          <div className='text-center'>
            <div className='text-lg font-bold text-white/90'>{opp.awayTeam}</div>
            <div className='text-[10px] text-white/30 mt-1'>{isZh ? '客队' : 'Away'}</div>
          </div>
        </div>
        <div className='flex items-center justify-center gap-4 text-[10px] text-white/20'>
          <span>{opp.remainingTime}</span>
          <Clock size={10} />
        </div>
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <div className='lg:col-span-2 space-y-5'>
          {/* AI Analysis */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]'>
            <div className='flex items-center gap-2 mb-5'>
              <Brain size={18} className='text-[#00d9ff]' />
              <h3 className='text-sm font-semibold text-white/80'>{isZh ? 'AI 智能分析' : 'AI Intelligence Analysis'}</h3>
            </div>
            {isLocked ? (
              <div className='relative'>
                <div className='blur-sm pointer-events-none opacity-30'>
                  <div className='grid grid-cols-3 gap-4 mb-4'>
                    {aiAnalysis.map(function(a, i) {
                      return (
                        <div key={i} className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                          <div className='text-xs text-white/40 mb-2'>{a.label}</div>
                          <div className='text-lg font-orbitron font-bold mb-2' style={{ color: a.color }}>{a.value}</div>
                          <div className='h-1.5 bg-white/[0.04] rounded-full overflow-hidden'>
                            <div className='h-full rounded-full transition-all' style={{ width: a.score * 100 + '%', backgroundColor: a.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                  <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center bg-[#141C2F]/90 px-8 py-6 rounded-2xl border border-white/[0.06]'>
                    <Lock size={24} className='mx-auto text-white/20 mb-3' />
                    <h4 className='text-sm font-semibold text-white/60 mb-1'>{isZh ? '报告已锁定' : 'Report Locked'}</h4>
                    <p className='text-[10px] text-white/30 mb-4'>{isZh ? '解锁以查看完整 AI 分析报告' : 'Unlock to view full AI analysis report'}</p>
                    {unlockError && <p className='text-[10px] text-red-400 mb-2'>{unlockError}</p>}
                    <button onClick={handleUnlock} disabled={unlockLoading}
                      className={
                        'px-5 py-2 text-xs font-semibold rounded-lg transition-all ' +
                        (unlockLoading ? 'bg-white/[0.06] text-white/30' : 'bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] hover:shadow-[0_0_16px_rgba(0,255,136,0.25)]')
                      }>
                      {unlockLoading
                        ? (isZh ? '处理中...' : 'Processing...')
                        : (isZh ? '解锁完整报告 - ' : 'Unlock Full Report - ') + (opp?.requiredCapital || 10) + ' USDT'}
                    </button>
                    {!user && (
                      <button onClick={() => openAuthModal('register')}
                        className="px-5 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] text-xs font-semibold rounded-lg hover:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all"
                      >
                        {isZh ? '立即解锁' : 'Unlock Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className='grid grid-cols-3 gap-4 mb-4'>
                  {aiAnalysis.map(function(a, i) {
                    return (
                      <div key={i} className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                        <div className='text-xs text-white/40 mb-2'>{a.label}</div>
                        <div className='text-lg font-orbitron font-bold mb-2' style={{ color: a.color }}>{a.value}</div>
                        <div className='h-1.5 bg-white/[0.04] rounded-full overflow-hidden'>
                          <div className='h-full rounded-full transition-all' style={{ width: a.score * 100 + '%', backgroundColor: a.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className='p-4 rounded-xl bg-gradient-to-r from-[#00ff88]/5 to-transparent border border-[#00ff88]/10'>
                  <div className='flex items-start gap-3'>
                    <Sparkles size={18} className='text-[#00ff88] mt-0.5' />
                    <div>
                      <p className='text-sm text-white/70 font-medium'>{isZh ? 'AI 推荐' : 'AI Recommendation'}</p>
                      <p className='text-xs text-white/40 mt-1'>{isZh ? '基于历史数据和实时市场分析，本机会具有高概率套利空间。建议立即执行交易计划。' : 'Based on historical data and real-time market analysis, this opportunity has high probability arbitrage potential. Recommended immediate execution.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Market Data */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]'>
            <h3 className='text-sm font-semibold text-white/80 mb-4'>{isZh ? '市场数据' : 'Market Data'}</h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='p-3 rounded-xl bg-white/[0.02]'>
                <div className='text-[10px] text-white/30 mb-1'>{isZh ? '收益率' : 'Yield'}</div>
                <div className='text-lg font-orbitron font-bold text-[#00ff88]'>+{opp.yield.toFixed(2)}%</div>
              </div>
              <div className='p-3 rounded-xl bg-white/[0.02]'>
                <div className='text-[10px] text-white/30 mb-1'>{isZh ? '利润' : 'Profit'}</div>
                <div className='text-lg font-orbitron font-bold text-white/80'>{'$'}{opp.profit.toFixed(2)}</div>
              </div>
              <div className='p-3 rounded-xl bg-white/[0.02]'>
                <div className='text-[10px] text-white/30 mb-1'>{isZh ? '所需资金' : 'Capital'}</div>
                <div className='text-lg font-orbitron font-bold text-white/80'>{'$'}{opp.requiredCapital.toLocaleString()}</div>
              </div>
              <div className='p-3 rounded-xl bg-white/[0.02]'>
                <div className='text-[10px] text-white/30 mb-1'>{isZh ? '可用量' : 'Volume'}</div>
                <div className='text-lg font-orbitron font-bold text-white/80'>{'$'}{opp.availableVolume.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>

          {/* Arbitrage Route */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]'>
            <h3 className='text-sm font-semibold text-white/80 mb-4'>{isZh ? '套利路线' : 'Arbitrage Route'}</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                <div className='text-xs text-white/40 mb-1'>{opp.bookmakerA?.name || 'Bet365'}</div>
                <div className='text-lg font-orbitron font-bold text-white/80'>{opp.bookmakerA?.odds?.toFixed(2) || '2.50'}</div>
                <div className='text-[10px] text-white/20 mt-1'>{isZh ? '赔率' : 'Odds'}</div>
              </div>
              <div className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                <div className='text-xs text-white/40 mb-1'>{opp.bookmakerB?.name || 'Betfair'}</div>
                <div className='text-lg font-orbitron font-bold text-white/80'>{opp.bookmakerB?.odds?.toFixed(2) || '2.45'}</div>
                <div className='text-[10px] text-white/20 mt-1'>{isZh ? '赔率' : 'Odds'}</div>
              </div>
            </div>
          </motion.div>

          {/* Historical Results */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className='bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]'>
            <h3 className='text-sm font-semibold text-white/80 mb-4'>{isZh ? '历史相似结果' : 'Historical Similar Results'}</h3>
            <div className='grid grid-cols-3 gap-4'>
              {historicalData.map(function(h, i) {
                return (
                  <div key={i} className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center'>
                    <div className='text-xs text-white/40 mb-2'>{h.label}</div>
                    <div className='text-lg font-orbitron font-bold text-[#00ff88]'>{h.winRate}</div>
                    <div className='text-[10px] text-white/30'>{h.avgProfit}</div>
                    <div className='text-[9px] text-white/20 mt-1'>{h.samples} {isZh ? '样本' : 'samples'}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
        {/* Right sidebar */}
        <div className='space-y-5'>
          {/* Execution Plan */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className={'bg-[#141C2F]/80 rounded-xl p-5 border transition-all ' + (isLocked ? 'border-white/[0.04]' : 'border-[#00ff88]/10') + ' relative'}
            style={isLocked ? {} : { borderColor: '#00ff8820' }}>
            <h3 className='text-sm font-semibold text-white/80 mb-4 flex items-center gap-2'>
              <Target size={16} className='text-[#00ff88]' />
              {isZh ? '执行计划' : 'Execution Plan'}
            </h3>
            {isLocked ? (
              <div className='text-center py-6'>
                <Lock size={20} className='mx-auto text-white/20 mb-2' />
                <p className='text-xs text-white/30'>{isZh ? '登录查看完整执行计划' : 'Log in to view execution plan'}</p>
                <button onClick={function() { openAuthModal('login'); }} className='mt-3 text-xs text-[#00ff88]/60 hover:text-[#00ff88] transition-all'>{isZh ? '登录' : 'Log In'}</button>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]'>
                  <span className='text-xs text-white/50'>{isZh ? '投注 A' : 'Stake A'}</span>
                  <span className='text-xs font-semibold text-white/80'>{'$'}{(opp.bookmakerA?.stake || 5600).toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]'>
                  <span className='text-xs text-white/50'>{isZh ? '投注 B' : 'Stake B'}</span>
                  <span className='text-xs font-semibold text-white/80'>{'$'}{(opp.bookmakerB?.stake || 4400).toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between p-2.5 rounded-lg bg-[#00ff88]/5'>
                  <span className='text-xs text-white/50'>{isZh ? '净利润' : 'Net Profit'}</span>
                  <span className='text-xs font-bold text-[#00ff88]'>{'$'}{opp.profit.toFixed(2)}</span>
                </div>
              </div>
            )}
          </motion.div>
          {/* Deposit CTA */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className='bg-gradient-to-br from-[#00ff88]/5 to-[#00d9ff]/5 rounded-xl p-5 border border-[#00ff88]/10'>
            <div className='flex items-center gap-2 mb-3'>
              <Coins size={18} className='text-[#ffd700]' />
              <h3 className='text-sm font-semibold text-white/80'>{isZh ? '开始套利' : 'Start Arbitrage'}</h3>
            </div>
            <p className='text-xs text-white/40 mb-4'>{isZh ? '充值最低 $10 即可解锁完整套利方案' : 'Deposit min $10 to unlock full arbitrage plan'}</p>
            <Link href='/deposit'
              className='block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] text-xs font-semibold hover:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all'>
              {isZh ? '立即充值' : 'Deposit Now'}</Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}