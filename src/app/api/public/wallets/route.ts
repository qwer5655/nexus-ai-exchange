import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    var { data, error } = await supabaseAdmin.from('wallets')
      .select('id, coin, network, address, icon_url, qr_code_url, enabled')
      .eq('enabled', true)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ wallets: data || [] })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

