'use client'
import { useState, useEffect } from 'react'
export default function SetupGuide() {
  var [sql, setSql] = useState('')
  var [copied, setCopied] = useState(false)
  var [status, setStatus] = useState('checking')
  var [tables, setTables] = useState<any[]>([])
  useEffect(function() {
    Promise.all([
      fetch('/api/setup').then(function(r: any) { return r.json() }),
      fetch('/api/setup/sql').then(function(r: any) { return r.json() })
    ]).then(function(d: any) {
      var ready = d[0].tables && d[0].tables.some(function(t: any) { return t.exists })
      setStatus(ready ? 'ready' : 'needs_setup')
      setTables(d[0].tables || [])
      if (d[1] && d[1].sql) setSql(d[1].sql)
    }).catch(function() { setStatus('error') })
  }, [])
  function copySQL() {
    navigator.clipboard.writeText(sql).then(function() {
      setCopied(true); setTimeout(function() { setCopied(false) }, 2000)
    })
  }
  return (
    <div style={{ background: '#0B1220', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>NEXUS AI EXCHANGE</div>
        <div style={{ color: '#666', fontSize: '13px', marginBottom: '30px' }}>Supabase - 数据库初始化</div>
        <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: '#00ff88', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>配置已就绪 ✓</div>
          <div style={{ color: '#999', fontSize: '12px' }}>npm 依赖 · 环境变量 · API 连接 · 服务层文件 — 全部完成</div>
        </div>
        {tables.length > 0 && (
          <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ddd', marginBottom: '10px' }}>数据库表状态</div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead><tr><td style={{ color: '#666', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>表名</td><td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>状态</td></tr></thead>
              <tbody>{tables.map(function(t: any) {
                return <tr key={t.table}><td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#aaa' }}>{t.table}</td><td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{t.exists ? <span style={{ color: '#00ff88' }}>已存在</span> : <span style={{ color: '#ff6b6b' }}>未创建</span>}</td></tr>
              })}</tbody>
            </table>
          </div>
        )}
        {status === 'needs_setup' && (
          <div>
            <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(0,217,255,0.1)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>1. 打开 Supabase SQL 编辑器</div>
              <a href='https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new' target='_blank'
                style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, #00ff88, #00d9ff)', color: '#05070c', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                打开 SQL 编辑器 →
              </a>
            </div>
            <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>2. 复制 SQL</div>
              <button onClick={copySQL}
                style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                {copied ? '已复制! ✓' : '复制 SQL (' + (sql ? sql.length + ' 字符)' : '加载中...)')}
              </button>
              {sql && <div style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '10px', whiteSpace: 'pre-wrap', color: '#888', maxHeight: '300px', overflowY: 'auto', lineHeight: '1.5' }}>{sql.substring(0, 3000)}</div>}
            </div>
            <div style={{ background: '#141C2F', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ color: '#00d9ff', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>3. 粘贴并运行</div>
              <p style={{ color: '#888', fontSize: '12px' }}>粘贴到 SQL 编辑器 → 点击 Run（或 Ctrl+Enter）→ 刷新本页确认</p>
            </div>
          </div>
        )}
        {status === 'ready' && (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ color: '#00ff88', fontSize: '24px', marginBottom: '8px' }}>全部就绪!</div>
            <a href='/' style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, #00ff88, #00d9ff)', color: '#05070c', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, marginTop: '12px', fontSize: '13px' }}>返回首页 →</a>
          </div>
        )}
      </div>
    </div>
  )
}
