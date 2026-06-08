import { createClient } from '@supabase/supabase-js'

var _supabaseUrl = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTA3MjYsImV4cCI6MjA5NjQyNjcyNn0.hoVRtNWXr0nzYLaQlR3yTlnOXUOlgBTYPMM1WdFBXjk'
var supabase = createClient(_supabaseUrl, _supabaseKey)
import type { Opportunity } from '@/types'

function mapDBToOpportunity(d: any): Opportunity {
  return {
    id: d.id || d.title?.substring(0, 6) || 'OPP',
    match: d.match_name || (d.home_team + ' vs ' + d.away_team),
    competition: d.league || '',
    yield: d.roi || 0,
    profit: d.profit || 0,
    requiredCapital: d.required_capital || 10000,
    availableVolume: d.volume || 0,
    riskScore: d.risk_level === 'low' ? 2 : d.risk_level === 'medium' ? 5 : 8,
    aiConfidence: d.confidence || 85,
    remainingTime: d.expires_at ? Math.floor((new Date(d.expires_at).getTime() - Date.now()) / 3600000) + 'h ' + Math.floor(((new Date(d.expires_at).getTime() - Date.now()) % 3600000) / 60000) + 'm' : '2h',
    status: (d.risk_level === 'low' ? 'HOT' : d.risk_level === 'medium' ? 'PREMIUM' : 'LIMITED') as any,
    homeTeam: d.home_team || '',
    awayTeam: d.away_team || '',
    league: d.league || '',
    bookmakerA: { name: d.bookmaker_a || 'Bookmaker A', odds: d.odds_a || 2.0, stake: Math.floor(d.required_capital * 0.52) || 5000 },
    bookmakerB: { name: d.bookmaker_b || 'Bookmaker B', odds: d.odds_b || 1.95, stake: Math.floor(d.required_capital * 0.48) || 5000 },
  }
}

export interface OppQuery {
  page?: number; limit?: number; search?: string;
  league?: string; riskLevel?: string;
  sortField?: string; sortDir?: 'asc' | 'desc';
}

export async function getOpportunities(query: OppQuery = {}) {
  var q = supabase.from('opportunities').select('*', { count: 'exact' })
  q = q.eq('status', 'published')
  if (query.search) {
    q = q.or('title.ilike.%' + query.search + '%,match_name.ilike.%' + query.search + '%')
  }
  if (query.league) {
    q = q.eq('league', query.league)
  }
  if (query.riskLevel) {
    q = q.eq('risk_level', query.riskLevel)
  }
  var sortField = query.sortField === 'yield' ? 'roi' : query.sortField === 'aiConfidence' ? 'confidence' : 'created_at'
  q = q.order(sortField, { ascending: query.sortDir === 'asc' })
  var page = query.page || 1; var limit = query.limit || 20
  var from = (page - 1) * limit; var to = from + limit - 1
  var { data, error, count } = await q.range(from, to)
  if (error) throw error
  return { data: (data || []).map(mapDBToOpportunity), count: count || 0, page, limit }
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  var { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single()
  if (error || !data) return null
  return mapDBToOpportunity(data)
}

export async function checkUnlocked(userId: string, oppId: string): Promise<boolean> {
  var { data } = await supabase.from('unlocks').select('id').eq('user_id', userId).eq('opportunity_id', oppId).maybeSingle()
  return !!data
}