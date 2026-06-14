import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
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
    return NextResponse.json({ opportunities: data || [], count: count || 0, page, limit })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
