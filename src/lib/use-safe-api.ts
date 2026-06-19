import { useEffect, useState } from 'react'

export function useSafeApi<T>(url: string, fallback: T, token?: string) {
  var [data, setData] = useState<T>(fallback)
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState<null | Error>(null)

  useEffect(function() {
    var mounted = true
    setLoading(true)
    setError(null)
    var options: RequestInit = {}
    if (token) options.headers = { 'Authorization': 'Bearer ' + token } as any
    fetch(url, options)
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(function(res) { if (!mounted) return; setData(res as T) })
      .catch(function(err) { if (!mounted) return; setError(err); console.error('[API FAIL]', url, err?.message || err) })
      .finally(function() { if (mounted) setLoading(false) })
    return function() { mounted = false }
  }, [url, token])

  return { data, loading, error }
}

export { SUMMARY_FALLBACK, assertSummary } from '@/lib/safe-fetch'
