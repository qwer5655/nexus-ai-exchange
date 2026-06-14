import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var type = url.searchParams.get('type') || 'users'
    var since = url.searchParams.get('since') || new Date(Date.now() - 30*86400000).toISOString()

    var rows: any[] = []; var headers: string[] = [];

    if (type === 'users') {
      var { data } = await supabaseAdmin.from('profiles').select('id,email,username,country,balance,vip_level,role,created_at').gte('created_at', since)
      rows = data || []; headers = ['id','email','username','country','balance','vip_level','role','created_at']
    } else if (type === 'deposits') {
      var { data: d } = await supabaseAdmin.from('deposits').select('id,user_id,coin,amount,status,created_at').gte('created_at', since)
      rows = d || []; headers = ['id','user_id','coin','amount','status','created_at']
    } else if (type === 'unlocks') {
      var { data: u } = await supabaseAdmin.from('unlocks').select('id,user_id,opportunity_id,unlock_price,created_at').gte('created_at', since)
      rows = u || []; headers = ['id','user_id','opportunity_id','unlock_price','created_at']
    } else if (type === 'audit') {
      var { data: a } = await supabaseAdmin.from('admin_logs').select('id,admin_id,action,target_type,target_id,created_at').gte('created_at', since)
      rows = a || []; headers = ['id','admin_id','action','target_type','target_id','created_at']
    } else { return NextResponse.json({ error: 'Invalid type' }, { status: 400 }) }

    var csv = headers.join(',') + '\n' + rows.map(function(r: any) { return headers.map(function(h) { return '"' + String(r[h] || '').replace(/"/g, '""') + '"' }).join(',') }).join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=' + type + '_export.csv' },
    })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}