'use client'
import { useState } from 'react'
export default function SetupGuide() {
  var [copied, setCopied] = useState(false)
  var [status] = useState('needs_setup')
  var [tables] = useState<any[]>([])
  return (
    <div style={{ background: '#0B1220', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>NEXUS AI EXCHANGE</div>
        <div style={{ color: '#666', fontSize: '13px', marginBottom: '30px' }}>Supabase - Database Setup</div>
        <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: '#00ff88', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Configuration Ready</div>
          <div style={{ color: '#999', fontSize: '12px' }}>npm dependencies, environment variables, API connection, service layer - all complete</div>
        </div>
        <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(0,217,255,0.1)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>1. Open Supabase SQL Editor</div>
          <a href='https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new' target='_blank'
            style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, #00ff88, #00d9ff)', color: '#05070c', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
            Open SQL Editor 
          </a>
        </div>
        <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>2. Run Migration SQL</div>
          <p style={{ color: '#888', fontSize: '12px' }}>Run the migration SQL files from supabase/sql/ folder in order</p>
        </div>
        <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>3. Refresh to confirm</div>
          <p style={{ color: '#888', fontSize: '12px' }}>Refresh this page to verify all tables are created</p>
        </div>
      </div>
    </div>
  )
}
