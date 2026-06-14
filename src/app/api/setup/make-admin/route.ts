import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    var { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })

    // Strategy A: Try to update the existing user's password via admin API
    try {
      var { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
      if (existing?.id) {
        var { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password })
        if (!updateError) return NextResponse.json({ success: true, userId: existing.id, method: 'updateUserById' })
      }
    } catch(e: any) {}

    // Strategy B: Try createUser which also sets password properly
    try {
      var { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username: email.split('@')[0] }
      })
      if (!error && data?.user) {
        await supabaseAdmin.from('profiles').insert({
          id: data.user.id, email, username: email.split('@')[0],
          role: 'admin', balance: 10000, referral_code: 'ADMIN' + email.split('@')[0].toUpperCase().slice(0,4)
        }).select().single()
        return NextResponse.json({ success: true, userId: data.user.id, method: 'createUser' })
      }
    } catch(e: any) {}

    // Strategy C: Direct HTTPS call via fetch to Supabase Auth API
    var url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    var key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    try {
      var resp = await fetch(url + '/auth/v1/admin/users', {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, email_confirm: true })
      })
      var respData = await resp.json()
      if (respData?.id) {
        await supabaseAdmin.from('profiles').insert({
          id: respData.id, email, username: email.split('@')[0],
          role: 'admin', balance: 10000, referral_code: 'ADMIN' + email.split('@')[0].toUpperCase().slice(0,4)
        }).select().single()
        return NextResponse.json({ success: true, userId: respData.id, method: 'directHTTPS' })
      }
    } catch(e: any) {}

    return NextResponse.json({ error: 'All auth methods failed' }, { status: 500 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}