import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var cohorts: any[] = []
    for (var w = 0; w < 12; w++) {
      var ws = new Date(Date.now() - (w + 1) * 7 * 86400000).toISOString()
      var we = new Date(Date.now() - w * 7 * 86400000).toISOString()
      var { data: cohort } = await supabaseAdmin.from('profiles').select('id').gte('created_at', ws).lt('created_at', we)
      if (!cohort || cohort.length === 0) continue
      var row: any = { week: ws.split('T')[0], registered: cohort.length }
      for (var r = 0; r <= w && r < 12; r++) {
        var { data: active } = await supabaseAdmin.from('analytics_events').select('user_id').in('user_id', cohort.map(function(u: any) { return u.id })).gte('created_at', new Date(Date.now() - r * 7 * 86400000).toISOString())
        row['w' + r] = new Set((active || []).map(function(e: any) { return e.user_id })).size
      }
      cohorts.push(row)
    }
    return NextResponse.json({ cohorts })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}