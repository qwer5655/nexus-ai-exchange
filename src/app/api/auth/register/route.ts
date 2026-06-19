import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    var { email, password, username, country, referralCode } = await req.json()
    if (!email || !password || !username) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    // Create user via Supabase Admin API with auto-confirmation
    var { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      email_confirm: true,
      user_metadata: { username, country: country || 'USA' }
    })

    // Fallback: direct GoTrue Admin API if admin.createUser fails
    if (authError || !authData?.user) {
      var suUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      var aKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      var sKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      var r = await fetch(suUrl + '/auth/v1/admin/users', {
        method: 'POST',
        headers: { 'apikey': aKey, 'Authorization': 'Bearer ' + sKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, email_confirm: true, data: { username, country: country || 'USA' } })
      })
      var d = await r.json()
      if (!d?.id) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
      // Confirm email via Admin API
      await supabaseAdmin.auth.admin.updateUserById(d.id, { email_confirm: true }).catch(function(){})
      authData = { user: d }
    }

    var userId = authData.user.id
    var refCode = 'NX' + username.toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase()

    // Create profile explicitly (trigger may have been dropped)
    await supabaseAdmin.from('profiles').upsert({
      id: userId, email, username, country: country || 'USA',
      role: 'user', balance: 0, referral_code: refCode,
      created_at: new Date().toISOString()
    })

    // Handle referral
    if (referralCode) {
      var { data: ref } = await supabaseAdmin.from('profiles').select('id').eq('referral_code', referralCode).maybeSingle()
      if (ref) {
        await supabaseAdmin.from('profiles').update({ referred_by: ref.id }).eq('id', userId)
        try { await supabaseAdmin.from('referrals').insert({ referrer_id: ref.id, referred_user_id: userId, commission: 0 }) } catch(e) {}
      }
    }

    return NextResponse.json({ user: { id: userId, email, username }, referral_code: refCode })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
