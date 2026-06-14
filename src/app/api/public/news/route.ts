import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export async function GET() {
  try {
    var { data } = await supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false }).limit(20)
    var news = (data || []).map(function(a: any) {
      return { id: a.id, title: a.title, summary: a.message || a.content || '', image: a.image_url || '', category: a.category || 'Platform', date: (a.created_at || '').split('T')[0], aiSummary: a.ai_summary || a.content || '' }
    })
    return NextResponse.json({ news })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}