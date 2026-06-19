import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  var results = []
  var tables = ['opportunities', 'profiles', 'deposits', 'unlocks', 'referrals', 'notifications', 'activity_feed']
  for (var tbl of tables) {
    try {
      var { data } = await supabaseAdmin.from(tbl).select('id').limit(1).maybeSingle()
      results.push({ table: tbl, exists: true })
    } catch(e) {
      results.push({ table: tbl, exists: false })
    }
  }
  return NextResponse.json({ tables: results })
}