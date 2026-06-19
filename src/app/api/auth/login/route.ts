import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    var { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    var { data: authData } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (!authData?.user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    var { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', authData.user.id).single()
    return NextResponse.json({ user: { id: authData.user.id, email: authData.user.email, username: profile?.username || email.split('@')[0], country: profile?.country || 'USA', role: profile?.role || 'user' } })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
