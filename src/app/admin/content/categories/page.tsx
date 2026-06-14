'use client'
import { useState, useEffect } from 'react'
export default function Categories() {
  var [categories, setCategories] = useState<any[]>([]); var [loading, setLoading] = useState(true)
  useEffect(function() {
    fetch('/api/admin/content/categories', { headers:{'x-admin-email':'benjoka912@gmail.com'} })
      .then(function(r){return r.json()}).then(function(d){setCategories(d.categories||[]); console.log('API DATA:', d);setLoading(false)})
      .catch(function(){setLoading(false)})
  }, [])
  if (loading) return <div className="p-6 text-white/40">Loading categories...</div>
  return <div className="p-6"><h1 className="text-xl font-bold text-white mb-1">Categories</h1><p className="text-sm text-white/30 mb-6">Manage categories</p>{categories.map(function(x,i){return<div key={x.name||i} className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4 mb-2 flex justify-between"><span>{x.name}</span><span className={"px-2 py-0.5 rounded text-xs "+(x.enabled===false?"bg-red-500/10 text-red-400":"bg-green-500/10 text-green-400")}>{x.enabled===false?'Inactive':'Active'}</span></div>})}</div>
}
