'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Eye, Trash2, Unlock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getMyUnlocks } from '@/services/unlock.service'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

export default function MyOpportunitiesPage() {
  var { favorites, user, toggleFavorite } = useAuthStore() as any;
  var { language } = useStore();
  var isZh = language === 'zh';
  var router = useRouter();

  if (!user) {
    return (
      <div className='text-center py-20'>
        <Star size={48} className='mx-auto text-white/10 mb-4' />
        <h2 className='text-xl font-orbitron font-bold text-white/60 mb-2'>{isZh ? '请先登录' : 'Please Log In'}</h2>
        <p className='text-sm text-white/30'>{isZh ? '登录后查看您收藏和已解锁的机会' : 'Log in to view your favorites and unlocked opportunities'}</p>
      </div>
    );
  }

  var [unlocks, setUnlocks] = useState<any[]>([])
  var [merged, setMerged] = useState<any[]>([])

  useEffect(function() {
    if (user) {
      getMyUnlocks(user.userId).then(function(d) { setUnlocks(d) }).catch(function() {})
    }
  }, [user])

  useEffect(function() {
    // Merge unlocked + favorited, dedup by opportunityId
    var unlockedMap = new Map()
    unlocks.forEach(function(u: any) { unlockedMap.set(u.opportunity_id, { ...u, type: 'unlocked' }) })

    favorites.forEach(function(f: any) {
      if (!unlockedMap.has(f.opportunityId)) {
        unlockedMap.set(f.opportunityId, {
          opportunity_id: f.opportunityId,
          savedAt: f.savedAt,
          isFavorite: true,
          type: 'favorited'
        })
      } else {
        var existing = unlockedMap.get(f.opportunityId)
        existing.isFavorite = true
        existing.type = 'mixed'
      }
    })

    var mergedArr = Array.from(unlockedMap.values())
    mergedArr.sort(function(a: any, b: any) {
      var aTime = a.created_at || a.savedAt || ''
      var bTime = b.created_at || b.savedAt || ''
      return bTime.localeCompare(aTime)
    })
    setMerged(mergedArr)
  }, [unlocks, favorites])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className='flex items-center gap-3 mb-6'>
          <Star size={24} className='text-[#ffd700]' />
          <h1 className='text-2xl md:text-3xl font-orbitron font-bold text-gradient-primary'>{isZh ? '我的机会' : 'My Opportunities'}</h1>
          <span className='text-xs text-white/30 ml-2'>({merged.length})</span>
        </div>
      </motion.div>

      {merged.length === 0 && (
        <div className='bg-white/[0.02] rounded-xl p-12 text-center border border-white/[0.04]'>
          <Star size={36} className='mx-auto text-white/10 mb-3' />
          <p className='text-sm text-white/30'>{isZh ? '还没有收藏或解锁的机会，去发现页面看看吧' : 'No saved or unlocked opportunities yet. Browse the discovery page!'}</p>
        </div>
      )}

      {merged.map(function(item: any) {
        var opp = item.opportunities || {}
        var matchName = opp.match_name || opp.title || (opp.home_team && opp.away_team ? opp.home_team + ' vs ' + opp.away_team : item.opportunity_id.substring(0, 8))
        var isFav = item.isFavorite || favorites.some(function(f: any) { return f.opportunityId === item.opportunity_id })
        var isUnlocked = item.type === 'unlocked' || item.type === 'mixed'
        var icon = isFav ? <Star size={14} className='text-[#ffd700]' /> : <Eye size={14} className='text-[#00d9ff]' />
        var badgeText = isUnlocked ? (isZh ? '已解锁' : 'Unlocked') : (isZh ? '已收藏' : 'Favorited')
        var badgeStyle = isUnlocked ? 'bg-green-500/10 text-green-400' : 'bg-[#ffd700]/10 text-[#ffd700]'

        return (
          <motion.div key={item.opportunity_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className='bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-all'
            onClick={function() { router.push('/opportunities'); }}>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center'>
                {isUnlocked ? <Unlock size={18} className='text-[#00ff88]' /> : icon}
              </div>
              <div>
                <div className='text-sm text-white/80 font-medium'>{matchName}</div>
                <div className='text-[10px] text-white/30 mt-0.5 flex items-center gap-2'>
                  <span>{item.type === 'unlocked' ? (isZh ? '已解锁' : 'Unlocked') : (isZh ? '已收藏' : 'Saved')}</span>
                  <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}</span>
                  {opp.roi ? <span className='text-[#00ff88]'>ROI {opp.roi}%</span> : null}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className={'text-[10px] px-2 py-0.5 rounded-full ' + badgeStyle}>{badgeText}</span>
              <button onClick={function(e) { e.stopPropagation(); toggleFavorite(item.opportunity_id); }}
                className={'p-1.5 transition-all ' + (isFav ? 'text-red-400 hover:text-red-300' : 'text-white/20 hover:text-white/40')}>
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
