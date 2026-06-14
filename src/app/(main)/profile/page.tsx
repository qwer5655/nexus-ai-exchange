'use client'
import { motion } from 'framer-motion'
import { User, Copy, Share2, Award, Check, Bell, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

function LoginHistoryView() {
  var { user } = useAuthStore()
  var [logs, setLogs] = useState<any[]>([])
  var [stats, setStats] = useState<any>({})
  var [loading, setLoading] = useState(true)
  useEffect(function() {
    if (!user?.email) return
    fetch('/api/auth/login-logs?email=' + encodeURIComponent(user.email)).then(function(r) { return r.json() }).then(function(d) { setLogs(d.logs || []); setStats(d.stats || {}); setLoading(false) }).catch(function() { setLoading(false) })
  }, [user?.email])
  if (loading) return <div className='text-center py-4'><div className='animate-spin h-5 w-5 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto' /></div>
  return (<div><div className='grid grid-cols-3 gap-3 mb-4'><div className='bg-white/5 rounded-lg p-3 text-center'><div className='text-lg font-orbitron font-bold text-[#00ff88]'>{stats.totalLogins || 0}</div><div className='text-[10px] text-white/40'>Total Logins</div></div><div className='bg-white/5 rounded-lg p-3 text-center'><div className='text-lg font-orbitron font-bold text-[#00d9ff]'>{stats.last30Days || 0}</div><div className='text-[10px] text-white/40'>Last 30 Days</div></div><div className='bg-white/5 rounded-lg p-3 text-center'><div className='text-xs font-mono text-white/60 truncate'>{stats.lastLogin?.ip_address || '-'}</div><div className='text-[10px] text-white/40'>Last IP</div></div></div><div className='space-y-1.5'>{logs.slice(0, 10).map(function(l: any, i: number) { var d = l.details || {}; return <div key={i} className='flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] text-xs'><span className='text-white/30'>{l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}</span><span className='text-white/40 font-mono'>{l.ip_address || '-'}</span><span className='text-white/30 hidden sm:inline'>{d.device || ''}</span><span className='text-white/30'>{d.browser ? d.browser + (d.os ? '/' + d.os : '') : ''}</span></div>})}{logs.length === 0 && <div className='text-center text-white/30 text-xs py-4'>No login records yet</div>}</div></div>)
}

export default function ProfilePage() {
  const { userBalance, userDeposits, language } = useStore()
  var { user } = useAuthStore()
  var [refData, setRefData] = useState<any>(null)
  var [refLoading, setRefLoading] = useState(true)
  var [referralCopied, setReferralCopied] = useState(false)
  var [notifs, setNotifs] = useState<any[]>([])
  var [notifUnread, setNotifUnread] = useState(0)
  var [notifLoading, setNotifLoading] = useState(true); var [achvs, setAchvs] = useState<any[]>([])

  useEffect(function() { fetch('/api/notifications?userId=' + (user as any)?.id + '&limit=10').then(function(r) { return r.json() }).then(function(d) { setNotifs(d.notifications || []); setNotifUnread(d.unread || 0); setNotifLoading(false) }).catch(function() { setNotifLoading(false) }) }, [(user as any)?.id])

  function markAllRead() { var ids = notifs.filter(function(n) { return !n.is_read }).map(function(n) { return n.id }); if (ids.length === 0) return; fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationIds: ids }) }).then(function() { setNotifs(notifs.map(function(n) { return { ...n, is_read: true } })); setNotifUnread(0) }) }

  useEffect(function() {
    if (!(user as any)?.id) return
    fetch('/api/referrals?userId=' + (user as any)?.id).then(function(r) { return r.json() }).then(function(d) { setRefData(d); setRefLoading(false) }).catch(function() { setRefLoading(false) })
  }, [(user as any)?.id])

  var referralLink = refData?.referral_code ? window.location.origin + '/register?ref=' + refData.referral_code : 'https://proodd.com/register?ref=' + ((user as any)?.id?.substring(0,8) || '')

  function copyReferral() {
    navigator.clipboard.writeText(referralLink)
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <User size={24} className="text-[#00ff88]" />
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold"><span className="text-gradient-primary">{t('nav.profile', language)}</span></h1>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center text-2xl font-bold text-[#05070c]">U</div>
              <div><h2 className="text-xl font-bold text-white">{t('profile.title', language)}</h2><p className="text-sm text-white/40">{t('profile.memberSince', language)} June 2026</p></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-orbitron font-bold text-[#00ff88]">{formatCurrency(userBalance)}</div><div className="text-xs text-white/40 mt-1">{t('profile.balance', language)}</div></div>
              <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-orbitron font-bold text-[#00d9ff]">{userDeposits.length}</div><div className="text-xs text-white/40 mt-1">{t('profile.deposits', language)}</div></div>
              <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-orbitron font-bold text-[#ffd700]">0</div><div className="text-xs text-white/40 mt-1">{t('profile.trades', language)}</div></div>
              <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-orbitron font-bold text-[#ff4d4f]">0%</div><div className="text-xs text-white/40 mt-1">{t('profile.winRate', language)}</div></div>
            </div>
          </div>

          {/* Referral System */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4"><Share2 size={18} className="text-[#ffd700]" /><h3 className="text-lg font-orbitron font-bold text-white">{t('profile.referralProgram', language)}</h3></div>
            <p className="text-sm text-white/40 mb-3">{t('profile.referralDesc', language)}</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/60 truncate">{referralLink}</div>
              <button onClick={copyReferral} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium hover:bg-[#00ff88]/20 transition-all">{referralCopied ? <Check size={16} /> : <Copy size={16} />}{referralCopied ? t('profile.copied', language) : t('profile.copy', language)}</button>
            </div>
            {!refLoading && refData && <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-lg font-bold text-[#00ff88]">{refData.total_referrals}</div><div className="text-[10px] text-white/40">Invites</div></div>
              <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-lg font-bold text-[#00d9ff]">{refData.active_referrals || 0}</div><div className="text-[10px] text-white/40">Active Ref</div></div>
              <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-lg font-bold text-[#ffd700]">${(refData.total_commission || 0).toFixed(2)}</div><div className="text-[10px] text-white/40">Earned</div></div>
            </div>}
            {refData?.referrals?.length > 0 && <div className="space-y-1">
              {refData.referrals.slice(0, 5).map(function(r: any, i: number) { return <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-xs"><span className="text-white/80">{r.referred_username || r.referred_email?.split('@')[0] || r.referred_user_id?.substring(0, 8)}</span><div className="flex items-center gap-2">{r.is_active ? <span className="text-green-400">Active Ref</span> : <span className="text-white/20">Inactive</span>}<span className="text-white/30">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span></div></div> })}
            </div>}
          </div>

          {/* Security */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4"><Shield size={18} className="text-[#00ff88]" /><h3 className="text-lg font-orbitron font-bold text-white">{t('profile.securityCenter', language)}</h3></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5"><span className="text-sm text-white/80">{t('profile.emailVerified', language)}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88]">{t('profile.verified', language)}</span></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5"><span className="text-sm text-white/80">{t('profile.twoFactor', language)}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{t('profile.disabled', language)}</span></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5"><span className="text-sm text-white/80">{t('profile.kyc', language)}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{t('profile.pending', language)}</span></div>
            </div>
          </div>

          {/* Login History */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4"><Shield size={18} className="text-[#00ff88]" /><h3 className="text-lg font-orbitron font-bold text-white">Login History</h3></div>
            <p className="text-xs text-white/30 mb-3">Your recent login activity</p>
            <LoginHistoryView />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {/* Achievements */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4"><Award size={18} className="text-[#ffd700]" /><h3 className="text-lg font-orbitron font-bold text-white">{t('profile.achievements', language)}</h3></div>
            <div className="space-y-3">{(achvs||[]).map((a) => (<div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 transition-all hover:bg-white/[0.08]"><div className="text-xl">{a.icon}</div><div><div className="text-sm text-white/80">{t('achv.' + a.id + '_name', language)}</div><div className="text-[10px] text-white/30">{t('achv.' + a.id + '_desc', language)}</div></div><div className="ml-auto">{a.unlocked ? <Check size={16} className="text-[#00ff88]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}</div></div>))}</div>
          </div>
          {/* Notifications */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4"><Bell size={18} className="text-[#00d9ff]" /><h3 className="text-lg font-orbitron font-bold text-white">{t('profile.notifications', language)}</h3></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg"><span className="text-xs text-white/60">{t('profile.oppAlerts', language)}</span><div className="w-10 h-5 rounded-full bg-[#00ff88] relative cursor-pointer"><div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" /></div></div>
              <div className="flex items-center justify-between p-2 rounded-lg"><span className="text-xs text-white/60">{t('profile.depositConf', language)}</span><div className="w-10 h-5 rounded-full bg-[#00ff88] relative cursor-pointer"><div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" /></div></div>
              <div className="flex items-center justify-between p-2 rounded-lg"><span className="text-xs text-white/60">{t('profile.marketUpdates', language)}</span><div className="w-10 h-5 rounded-full bg-white/20 relative cursor-pointer"><div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40" /></div></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


