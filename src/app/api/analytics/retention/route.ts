import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var results: any[] = []; var periods = [1, 7, 30]
    for (var p of periods) {
      var since = new Date(Date.now() - (p + 1) * 86400000).toISOString()
      var cohortEnd = new Date(Date.now() - p * 86400000).toISOString()
      var { data: cohort } = await supabaseAdmin.from('profiles').select('id').gte('created_at', since).lt('created_at', cohortEnd)
      if (!cohort || cohort.length === 0) { results.push({ period: 'D' + p, cohort_size: 0, retained: 0, rate: 0 }); continue }
      var { data: active } = await supabaseAdmin.from('analytics_events').select('user_id').in('user_id', cohort.map(function(u: any) { return u.id })).gte('created_at', since)
      var retained = new Set((active || []).map(function(e: any) { return e.user_id }))
      results.push({ period: 'D' + p, cohort_size: cohort.length, retained: retained.size, rate: cohort.length > 0 ? Math.round(retained.size / cohort.length * 100) : 0 })
    }
    return NextResponse.json({ retention: results })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}