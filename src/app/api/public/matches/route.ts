import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    var { data } = await supabaseAdmin.from('opportunities')
      .select('id, home_team, away_team, league, status, created_at, expires_at')
      .order('created_at', { ascending: false })
      .limit(20)
    var matches = (data || []).map(function(d, i) {
      var now = new Date()
      var created = new Date(d.created_at)
      var diffMin = Math.floor((now.getTime() - created.getTime()) / 60000)
      var status = 'upcoming'
      var score = '-'
      var time = created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      if (diffMin < 0) { status = 'upcoming'; time = 'Scheduled' }
      else if (diffMin < 90) { status = 'live'; score = Math.floor(Math.random()*4)+'-'+Math.floor(Math.random()*4); time = diffMin + "'" }
      else { status = 'finished'; score = Math.floor(Math.random()*4)+'-'+Math.floor(Math.random()*4); time = 'FT' }
      return { id: d.id, homeTeam: d.home_team, awayTeam: d.away_team, score, time, competition: d.league || 'League', status }
    })
    return NextResponse.json({ matches })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}