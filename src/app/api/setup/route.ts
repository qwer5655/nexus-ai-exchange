import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var srvKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0'
var supa = createClient('https://dcfwldxwyvvotvfdnywy.supabase.co', srvKey)

export async function GET() {
  var results = []
  var tables = ['opportunities', 'profiles', 'deposits', 'unlocks', 'referrals', 'notifications', 'activity_feed']
  for (var tbl of tables) {
    try {
      var { data } = await supa.from(tbl).select('id').limit(1).maybeSingle()
      results.push({ table: tbl, exists: true })
    } catch(e) {
      results.push({ table: tbl, exists: false })
    }
  }
  return NextResponse.json({ tables: results })
}
