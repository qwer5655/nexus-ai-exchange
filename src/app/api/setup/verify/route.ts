import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  var supabase = createClient('https://dcfwldxwyvvotvfdnywy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0')
  try {
    var { data } = await supabase.from('profiles').select('id').limit(1)
    return NextResponse.json({ ready: true, message: 'Database is ready! Tables exist.' })
  } catch(e: any) {
    return NextResponse.json({ ready: false, error: e.message, hint: 'Run the SQL migration first' })
  }
}