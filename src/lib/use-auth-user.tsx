'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api-client'

// Module-level cache to prevent duplicate in-flight API calls
var authCache: { user: any; ts: number } | null = null
var AUTH_CACHE_TTL = 30000
var pendingAuthCall: Promise<any> | null = null

export function useAuthUser() {
  var [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null)
  var [loading, setLoading] = useState(true)
  var mountedRef = useRef(true)

  useEffect(function() {
    mountedRef.current = true
    return function() { mountedRef.current = false }
  }, [])

  useEffect(function() {
    (async function() {
      try {
        // Check in-memory cache (30s TTL)
        if (authCache && Date.now() - authCache.ts < AUTH_CACHE_TTL) {
          if (mountedRef.current) {
            setUser(authCache!.user)
            setLoading(false)
          }
          return
        }

        // Dedup concurrent calls (StrictMode safe)
        if (!pendingAuthCall) {
          pendingAuthCall = (async function() {
            var { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) return null
            var userData = await api.get<any>('/auth/me', {
              headers: { 'Authorization': 'Bearer ' + session.access_token }
            })
            return userData.id ? { id: userData.id, email: userData.email, role: userData.role || 'user' } : null
          })()
        }

        var result = await pendingAuthCall
        pendingAuthCall = null

        if (result) {
          authCache = { user: result, ts: Date.now() }
        }

        if (mountedRef.current) {
          setUser(result as any)
          setLoading(false)
        }
      } catch(e: any) {}
      if (mountedRef.current) setLoading(false)
    })()
  }, [])

  return { user, loading }
}
