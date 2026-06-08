'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, Zap, Clock, AlertCircle, ArrowUpRight, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOpportunities } from '@/services/opportunity.service';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { t, translateMatch, translateCompetition } from '@/lib/i18n';
import { formatCurrency, formatPercent, getStatusColor, getRiskColor, getConfidenceColor } from '@/lib/utils';
import type { Opportunity } from '@/types';
function StatusBadge({ status, language }: { status: string; language: string }) {  const color = getStatusColor(status);
  return (    <span      className="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron"      style={{ color, backgroundColor: color + '20', border: '1px solid ' + color + '40' }}    >      {t('common.' + status.toLowerCase(), language as any)}    </span>  )}
function RiskBar({ score }: { score: number }) {  const color = getRiskColor(score);
  return (    <div className="flex items-center gap-2">      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">        <div className="h-full rounded-full transition-all" style={{ width: (score / 10) * 100 + '%', backgroundColor: color }} />      </div>      <span className="font-mono text-xs" style={{ color }}>{score}/10</span>    </div>  )}
function ConfidenceBadge({ score }: { score: number }) {  const color = getConfidenceColor(score);
  return (    <span className="font-mono text-sm font-bold" style={{ color }}>{score}%</span>  )}

export default function OpportunityTable() {  const { setShowMatchModal, addNotification, language } = useStore();
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [search, setSearch] = useState('');
const [sortField, setSortField] = useState<keyof Opportunity>('yield');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('all');
useEffect(() => {    setLoading(true); setError('');
    getOpportunities({ page, limit: 20, search }).then(function(result) {      setData(result.data); setTotal(result.count); setLoading(false)    }).catch(function(e) {      setError(e.message || 'Failed to load'); setLoading(false)    })  }, [page, search]);
function updateTime(time: string) {    const parts = time.split(/[hms]/);
let hours = parseInt(parts[0]) || 0;
  let mins = parseInt(parts[1]) || 0;
  const secs = parseInt(parts[2]) || 0;
  if (secs > 0) { mins -= 1; if (mins < 0) { mins = 59; hours -= 1 } }
    if (hours < 0) return 'Expired';
    if (hours === 0 && mins <= 5) return mins + 'm ' + Math.floor(Math.random() * 60) + 's';
    return hours + 'h ' + mins + 'm'  }
const filtered = useMemo(() => {    let result = [...data];
  if (filter !== 'all') result = result.filter((o) => o.status === filter.toUpperCase());
    result.sort((a, b) => {      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal    });
return result  }, [data, filter, sortField, sortDir]);
const columns = [    { key: 'match', label: t('opportunities.match', language as any), sortable: false },    { key: 'competition', label: t('opportunities.competition', language as any), sortable: false },    { key: 'yield', label: t('opportunities.yield', language), sortable: true },    { key: 'profit', label: t('opportunities.profit', language), sortable: true },    { key: 'requiredCapital', label: t('opportunities.capital', language), sortable: true },    { key: 'availableVolume', label: t('opportunities.volume', language), sortable: true },    { key: 'riskScore', label: t('opportunities.risk', language), sortable: true },    { key: 'aiConfidence', label: t('opportunities.aiConf', language), sortable: true },    { key: 'remainingTime', label: t('opportunities.time', language), sortable: false },    { key: 'status', label: t('opportunities.status', language), sortable: false },    { key: 'action', label: '', sortable: false },  ];
  function handleSort(key: keyof Opportunity) {    if (sortField === key) {      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')    } else {      setSortField(key);
      setSortDir('desc');
  }  }
return (
    <section className="py-16 relative z-10">
      {loading && (
        <div className="text-center py-20">
          <div className="text-white/30">{t('common.loading', language as any)}</div>
        </div>
      )}
      {!loading && error && (
        <div className="text-center py-20">
          <div className="text-red-400 text-sm mb-4">{error}</div>
          <button onClick={() => setPage(1)}
            className="px-4 py-2 rounded-lg bg-[#00ff88]/10 text-[#00ff88] text-xs font-medium hover:bg-[#00ff88]/20 transition-all"
          >
            {t('common.retry', language as any) || 'Retry'}
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-20">
          <div className="text-white/30">No opportunities found</div>
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-6 flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-orbitron font-bold">
                  <span className="text-gradient-primary">{t('opportunities.title', language as any)}</span>
                </h2>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20">
                  <Zap size={12} className="text-[#00ff88]" />
                  <span className="text-[#00ff88] text-xs font-orbitron">{t('opportunities.live', language as any)}</span>
                </div>
              </div>
              <p className="text-white/40 text-sm mt-1">{t('opportunities.subtitle', language as any)}</p>
            </div>
            <div className="flex gap-2">
              {['all', 'hot', 'limited', 'premium', 'exclusive'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' +
                    (filter === f ? 'bg-[#00ff88] text-[#05070c]' : 'glass-card text-white/60 hover:text-white')
                  }
                >
                  {t('common.' + f, language as any)}
                </button>
              ))}
            </div>
          </motion.div>
          <div className="glass-card rounded-xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={
                          'px-4 py-3 text-left text-xs text-white/40 font-orbitron font-medium ' +
                          (col.sortable ? 'cursor-pointer hover:text-white/60' : '')
                        }
                        onClick={() => col.sortable && handleSort(col.key as keyof Opportunity)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && sortField === col.key && (
                            <span>{sortDir === 'desc' ? ' \u2193' : ' \u2191'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.slice(0, 25).map((opp) => (
                      <motion.tr
                        key={opp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{translateMatch(opp.match, language)}</div>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">{translateCompetition(opp.competition, language)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[#00ff88] font-mono font-bold">{formatPercent(opp.yield)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#00ff88] font-mono">{formatCurrency(opp.profit)}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-white/60">{formatCurrency(opp.requiredCapital)}</td>
                        <td className="px-4 py-3 font-mono text-white/60">{formatCurrency(opp.availableVolume)}</td>
                        <td className="px-4 py-3"><RiskBar score={opp.riskScore} /></td>
                        <td className="px-4 py-3"><ConfidenceBadge score={opp.aiConfidence} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-white/40 font-mono text-xs">
                            <Clock size={12} />
                            {opp.remainingTime}
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={opp.status} language={language} /></td>
                        <td className="px-4 py-3">
                          <Link
                            href={'/opportunity/' + opp.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00ff88]/10 text-[#00ff88] text-xs font-medium hover:bg-[#00ff88]/20 transition-all"
                          >
                            <Eye size={14} />
                            {t('opportunities.view', language as any)}
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4">
            <span className="text-[10px] text-white/30">{t('opportunities.title', language)}: {data.length} / {total}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-white/30">{page}</span>
              <button
                disabled={data.length < 20}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}