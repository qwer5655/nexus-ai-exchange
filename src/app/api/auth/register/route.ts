import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

var _sKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
var _aKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
var _suUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

export async function POST(req: Request) {
  try {
    var { email, password, username, country, referralCode } = await req.json()
    if (!email || !password || !username) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    // Method 1: RPC register_user
    try {
      var { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('register_user', {
        p_email: email, p_password: password, p_username: username, p_country: country || 'USA'
      })
      if (rpcResult && rpcResult.id) {
        var refCode = rpcResult.referral_code || 'NX' + username.toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase()
        if (referralCode) {
          try {
            var ref = await supabaseAdmin.from('profiles').select('id').eq('referral_code', referralCode).single()
            if (ref.data) {
              await supabaseAdmin.from('profiles').update({ referred_by: ref.data.id }).eq('id', rpcResult.id)
              await supabaseAdmin.from('referrals').insert({ referrer_id: ref.data.id, referred_user_id: rpcResult.id, commission: 0 })
              try { await supabaseAdmin.from('notifications').insert({ user_id: ref.data.id, title: 'New referral', message: username + ' joined via your invite link' }) } catch(e) {}
            }
          } catch(e: any) {}
        }
        return NextResponse.json({ user: { id: rpcResult.id, email, username }, referral_code: refCode })
      }
    } catch(e: any) { console.error('RPC method failed:', e?.message) }

    // Method 2: GoTrue Admin API
    try {
      var r2 = await fetch(_suUrl + '/auth/v1/admin/users', {
        method: 'POST',
        headers: { 'apikey': _aKey, 'Authorization': 'Bearer ' + _sKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, email_confirm: true, data: { username, country: country || 'USA' } })
      })
      var d2 = await r2.json()
      if (d2?.id) {
        var refCode2 = 'NX' + username.toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase()
      try { await supabaseAdmin.from('profiles').update({ country: country || 'USA', referral_code: refCode2 }).eq('id', d2.id) } catch(e2: any) {}
        if (referralCode) {
          try {
            var ref2 = await supabaseAdmin.from('profiles').select('id').eq('referral_code', referralCode).single()
            if (ref2.data) {
              await supabaseAdmin.from('profiles').update({ referred_by: ref2.data.id }).eq('id', d2.id)
              await supabaseAdmin.from('referrals').insert({ referrer_id: ref2.data.id, referred_user_id: d2.id, commission: 0 })
              try { await supabaseAdmin.from('notifications').insert({ user_id: ref2.data.id, title: 'New referral', message: username + ' joined via your invite link' }) } catch(e) {}
            }
          } catch(e: any) {}
        }
        return NextResponse.json({ user: { id: d2.id, email, username }, referral_code: refCode2 })
      }
    } catch(e: any) {}

    return NextResponse.json({ error: 'Registration failed. DB function may not exist yet.' }, { status: 500 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}




