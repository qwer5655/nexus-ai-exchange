'use client'
import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
export default function Tags() {
  var [tags, setTags] = useState<any[]>([]); var [loading, setLoading] = useState(true)
  useEffect(function() {
    adminFetch('/api/admin/content/tags')
      .then(function(r){return r.json()}).then(function(d){setTags(d.tags||[]); console.log('API DATA:', d);setLoading(false)})
      .catch(function(){setLoading(false)})
  }, [])
  if (loading) return <div className="p-6 text-white/40">Loading tags...</div>
  return <div className="p-6"><h1 className="text-xl font-bold text-white mb-1">Tags</h1><p className="text-sm text-white/30 mb-6">Manage tags</p><div className="flex flex-wrap gap-2">{tags.map(function(x,i){return<div key={x.name||i} className="px-3 py-1.5 bg-[#0A0E1A] border border-white/[0.04] rounded-lg text-sm text-white/80">{x.name}<span className="ml-2 text-white/30 text-xs">{(x.created_at||'').split('T')[0]}</span></div>})}</div></div>
}



