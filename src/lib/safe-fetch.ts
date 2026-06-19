// Safe fetch with typed fallback
export async function safeFetch<T>(url: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    var res = await fetch(url, options)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch(e: any) {
    console.error('[API FAIL]', url, e?.message || e)
    return fallback
  }
}

// Runtime type guard for ledger summary
export interface LedgerSummary {
  balance: number
  totalDeposit: number
  totalProfit: number
  profitPercent: number
  transactionCount: number
  vipLevel: number
  targetProfit: number
}

export function assertSummary(d: any): LedgerSummary {
  return {
    balance: Number(d?.balance ?? 0),
    totalDeposit: Number(d?.totalDeposit ?? 0),
    totalProfit: Number(d?.totalProfit ?? 0),
    profitPercent: Number(d?.profitPercent ?? 0),
    transactionCount: Number(d?.transactionCount ?? 0),
    vipLevel: Number(d?.vipLevel ?? 0),
    targetProfit: Number(d?.targetProfit ?? 1000)
  }
}

export const SUMMARY_FALLBACK: LedgerSummary = {
  balance: 0, totalDeposit: 0, totalProfit: 0,
  profitPercent: 0, transactionCount: 0, vipLevel: 0, targetProfit: 1000
}
