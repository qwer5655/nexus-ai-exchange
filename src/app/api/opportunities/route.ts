import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    // Optional VIP check (PUBLIC LIST / PRIVATE DETAILS mode)
    var isVip = false
    var authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        var { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7))
        if (user) {
          var { data: profile } = await supabaseAdmin.from('profiles').select('vip_level').eq('id', user.id).single()
          isVip = (profile?.vip_level || 0) > 0
        }
      } catch {}
    }

    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '20')
    var search = url.searchParams.get('search') || ''
    var league = url.searchParams.get('league') || ''
    var riskLevel = url.searchParams.get('riskLevel') || ''
    var sortField = url.searchParams.get('sortField') || 'created_at'
    var sortDir = url.searchParams.get('sortDir') || 'desc'

    var q = supabaseAdmin.from('opportunities').select('*', { count: 'exact' })
    if (search) q = q.or('title.ilike.%' + search + '%,match_name.ilike.%' + search + '%')
    if (league) q = q.eq('league', league)
    if (riskLevel) q = q.eq('risk_level', riskLevel)
    var dbSortField = sortField === 'roi' ? 'roi' : sortField === 'confidence' ? 'confidence' : 'created_at'
    q = q.order(dbSortField, { ascending: sortDir === 'asc' })
    var from = (page - 1) * limit; var to = from + limit - 1

    var { data, count } = await q.range(from, to)
    var result = (data || []).map(function(o: any) {
      if (isVip) return o
      return {
        id: o.id, title: o.title, match_name: o.match_name,
        home_team: o.home_team, away_team: o.away_team,
        league: o.league, roi: o.roi,
        confidence: o.confidence, risk_level: o.risk_level,
        status: o.status, created_at: o.created_at
      }
    })
    return NextResponse.json({ opportunities: result, count: count || 0, page, limit, vip: isVip })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
