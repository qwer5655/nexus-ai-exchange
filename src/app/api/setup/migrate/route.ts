import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Try to check if banned column exists
    try {
      await supabaseAdmin.from('profiles').select('banned').limit(1)
      return NextResponse.json({ status: 'column_exists' })
    } catch(e: any) {
      // Column doesn't exist, try to add it via Supabase Management API
      var key = ''
      var url = ''
      try {
        var supabaseModule = require('@/lib/supabase')
        key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0'
        url = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
      } catch(me: any) {}

      // Use PostgREST directly to execute SQL via the REST API
      var resp = await fetch(url + '/rest/v1/rpc/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': 'Bearer ' + key
        }
      })

      // Try direct SQL via Supabase dashboard API
      var sqlResp = await fetch('https://api.supabase.com/v1/projects/dcfwldxwyvvotvfdnywy/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({ query: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false' })
      })

      var sqlResult = await sqlResp.text()
      return NextResponse.json({ message: 'attempted migration', result: sqlResult, error: e.message })
    }
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
