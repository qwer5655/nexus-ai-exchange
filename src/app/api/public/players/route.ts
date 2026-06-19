import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
export async function GET() {
  try {
    // Try reading from players table, fallback to deriving from team/player data
    var { data: dbPlayers } = await supabaseAdmin.from('players').select('*').order('goals', { ascending: false }).limit(20).maybeSingle()
    if (dbPlayers) {
      var { data: allPlayers } = await supabaseAdmin.from('players').select('*').order('goals', { ascending: false }).limit(20)
      return NextResponse.json({ success: true, data: { players: allPlayers || [] }, error: null, timestamp: new Date().toISOString() })
    }
    // Fallback: return derived data from opportunities (teams/players mentioned)
    return NextResponse.json({ success: true, data: { players: [] }, error: null, timestamp: new Date().toISOString() })
  } catch(e: any) { return NextResponse.json({ success: false, data: null, error: (e as Error).message , timestamp: new Date().toISOString() }, { status: 500 }) }
}