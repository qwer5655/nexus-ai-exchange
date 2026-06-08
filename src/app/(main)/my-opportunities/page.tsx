'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, Eye, Heart, Trash2, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getMyUnlocks } from '@/services/unlock.service'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
export default function MyOpportunitiesPage() {
  var { favorites, user } = useAuthStore() as any;
  var { language } = useStore();
  var isZh = language === 'zh';
  var router = useRouter();
  var [tab, setTab] = useState<'favorites' | 'history'>('favorites');

  if (!user) {
    return (
      <div className='text-center py-20'>
        <Star size={48} className='mx-auto text-white/10 mb-4' />
        <h2 className='text-xl font-orbitron font-bold text-white/60 mb-2'>{isZh ? '请先登录' : 'Please Log In'}</h2>
        <p className='text-sm text-white/30'>{isZh ? '登录后查看您的收藏和浏览记录' : 'Log in to view your favorites and history'}</p>
      </div>
    );
  }

  var [unlocks, setUnlocks] = useState<any[]>([])

  useEffect(function() {
    if (user) {
      getMyUnlocks(user.userId).then(function(d) { setUnlocks(d) }).catch(function() {})
    }
  }, [user])

  var favs = unlocks;
  var history: any[] = [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className='flex items-center gap-3 mb-6'>
          <Star size={24} className='text-[#ffd700]' />
          <h1 className='text-2xl md:text-3xl font-orbitron font-bold text-gradient-primary'>{isZh ? '我的机会' : 'My Opportunities'}</h1>
        </div>
        <div className='flex gap-2 mb-6'>
          <button onClick={function() { setTab('favorites'); }}
            className={'px-4 py-2 rounded-lg text-xs font-medium transition-all ' + (tab === 'favorites' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'bg-white/5 text-white/40 hover:text-white/60 border border-transparent')}>{isZh ? '收藏' : 'Favorites'} ({favs.length})</button>
          <button onClick={function() { setTab('history'); }}
            className={'px-4 py-2 rounded-lg text-xs font-medium transition-all ' + (tab === 'history' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'bg-white/5 text-white/40 hover:text-white/60 border border-transparent')}>{isZh ? '浏览记录' : 'History'} ({history.length})</button>
        </div>
      </motion.div>

      {favs.length === 0 && tab === 'favorites' && (
        <div className='glass-card rounded-xl p-12 text-center'>
          <Heart size={36} className='mx-auto text-white/10 mb-3' />
          <p className='text-sm text-white/30'>{isZh ? '还没有收藏的机会，去发现页面看看吧' : 'No favorites yet. Browse opportunities and star them!'}</p>
        </div>
      )}

      {history.length === 0 && tab === 'history' && (
        <div className='glass-card rounded-xl p-12 text-center'>
          <Eye size={36} className='mx-auto text-white/10 mb-3' />
          <p className='text-sm text-white/30'>{isZh ? '还没有浏览记录' : 'No browsing history yet'}</p>
        </div>
      )}

      {(tab === 'favorites' ? favs : history).map(function(f) {
        return (
          <motion.div key={f.opportunityId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className='glass-card rounded-xl p-4 border border-white/5 mb-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-all'
            onClick={function() { router.push('/opportunities'); }}>
            <div className='flex items-center gap-3'>
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + (f.isFavorite ? 'bg-[#ffd700]/10 text-[#ffd700]' : 'bg-[#00d9ff]/10 text-[#00d9ff]')}>
                {f.isFavorite ? <Star size={18} /> : <Eye size={18} />}
              </div>
              <div>
                <div className='text-sm text-white/80 font-medium'>{f.opportunityId}</div>
                <div className='text-[10px] text-white/30 mt-0.5'>{f.savedAt}</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (f.isFavorite ? 'bg-[#ffd700]/10 text-[#ffd700]' : 'bg-[#00d9ff]/10 text-[#00d9ff]')}>{f.isFavorite ? (isZh ? '已收藏' : 'Favorited') : (isZh ? '已浏览' : 'Viewed')}</span>
              <button onClick={function(e) { e.stopPropagation(); }} className='p-1.5 text-white/20 hover:text-red-400 transition-all'><Trash2 size={14} /></button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}