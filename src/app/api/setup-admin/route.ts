import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    var { data: users } = await supabaseAdmin.from('profiles').select('id,email,username,role').order('created_at', { ascending: true }).limit(1)
    if (!users || users.length === 0) return NextResponse.json({ error: 'No users found' })
    var user = users[0]
    await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    return NextResponse.json({ success: true, user: user.email + ' is now admin' })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}