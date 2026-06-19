'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight, History } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStore } from '@/store/useStore'
import Link from 'next/link'
import { api } from '@/lib/api-client'

export default function WithdrawPage() {
  var { user, refreshProfile } = useAuthStore() as any;
  var { language } = useStore();
  var isZh = language === 'zh';
  var [amount, setAmount] = useState('')
  var [walletAddress, setWalletAddress] = useState('')
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [success, setSuccess] = useState('')
  var [withdrawals, setWithdrawals] = useState<any[]>([])

  useEffect(function() {
    if (user?.userId) {
      api.get('/withdrawals?userId=' + user.userId).then(function(d:any) {
        if (d.withdrawals) setWithdrawals(d.withdrawals)
      }).catch(function() {})
    }
  }, [user?.userId])

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError('')
    setSuccess('')
    var amt = parseFloat(amount)
    if (isNaN(amt) || amt < 10) { setError(isZh ? '最小提现金额为 ' : 'Minimum withdrawal is '); return }
    if (!walletAddress.trim()) { setError(isZh ? '请输入钱包地址' : 'Enter wallet address'); return }
    setLoading(true)
    try {
      var data: any = await api.post('/withdrawals', { userId: user.userId, amount: amt, walletAddress: walletAddress.trim() })
      if (data.error) { setError(data.error || 'Failed'); setLoading(false); return }
      setSuccess(isZh ? '提现申请已提交，等待审核' : 'Withdrawal request submitted')
      setAmount('')
      setWalletAddress('')
      if (refreshProfile) await refreshProfile()
      var r: any = await api.get('/withdrawals?userId=' + user.userId)
      if (r.withdrawals) setWithdrawals(r.withdrawals)
    } catch(e: any) { setError(e.message) }
    setLoading(false)
  }

  function getStatusStyle(st: string) {
    var map: any = { pending: 'bg-yellow-500/10 text-yellow-400', approved: 'bg-green-500/10 text-green-400', rejected: 'bg-red-500/10 text-red-400', completed: 'bg-blue-500/10 text-blue-400', cancelled: 'bg-white/10 text-white/40' }
    return map[st] || 'bg-white/10 text-white/60'
  }

  if (!user) {
    return <div className="text-center py-20 text-white/40">{isZh ? '请先登录' : 'Please log in'}</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6"><Wallet size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-gradient-primary">{isZh ? '提现' : 'Withdraw'}</h1></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div><span className="text-xs text-white/30">{isZh ? '可用余额' : 'Available Balance'}</span>
            <div className="text-2xl font-bold text-white mt-1"></div></div>
          <Link href="/deposit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] text-sm font-semibold">{isZh ? '充值' : 'Deposit'}</Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04] mb-6">
        <h2 className="text-lg font-orbitron font-bold mb-4">{isZh ? '提现申请' : 'Withdrawal Request'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">{isZh ? '金额 (USD)' : 'Amount (USD)'}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input type="number" step="0.01" min="10" value={amount} onChange={function(e) { setAmount(e.target.value); setError('') }}
                className="w-full pl-8 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40"
                placeholder="10.00" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">{isZh ? 'USDT TRC20 钱包地址' : 'USDT TRC20 Wallet Address'}</label>
            <input type="text" value={walletAddress} onChange={function(e) { setWalletAddress(e.target.value); setError('') }}
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 font-mono"
              placeholder="TXYZ..." />
            <p className="text-[10px] text-white/20 mt-1">{isZh ? '仅支持 USDT TRC20 网络' : 'Only USDT TRC20 network supported'}</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-400">{success}</p>}

          <button type="submit" disabled={loading || !user.balance || user.balance < 10}
            className={"w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 " + (loading ? "bg-white/[0.06] text-white/30" : "bg-gradient-to-r from-[#00ff88] to-[#00d9ff] text-[#05070c] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-[0.98]")}
          >{loading ? (isZh ? '提交中...' : 'Submitting...') : (isZh ? '提交提现申请' : 'Submit Withdrawal Request')}</button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#141C2F]/80 rounded-xl p-6 border border-white/[0.04]">
        <h2 className="text-lg font-orbitron font-bold mb-4 flex items-center gap-2"><History size={18} />{isZh ? '提现记录' : 'Withdrawal History'}</h2>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-white/30">{isZh ? '暂无提现记录' : 'No withdrawal history'}</p></div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map(function(w: any) {
              var details: any = {}
              try { details = JSON.parse(w.description || '{}') } catch(e) {}
              var st = details.status || 'pending'
              return (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><ArrowUpRight size={14} className="text-red-400" /></div>
                    <div><div className="text-sm font-medium text-white/80"></div>
                      <div className="text-[10px] text-white/30 mt-0.5">{details.walletAddress?.substring(0, 12)}...{new Date(w.created_at).toLocaleDateString()}</div></div>
                  </div>
                  <span className={"text-[10px] px-2 py-0.5 rounded-full " + getStatusStyle(st)}>{st}</span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
