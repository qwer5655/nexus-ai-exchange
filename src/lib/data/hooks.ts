import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'

// ---------- Query key constants ----------
export var queryKeys = {
  user: ['user'] as const,
  matches: ['matches'] as const,
  opportunities: ['opportunities'] as const,
  notifications: ['notifications'] as const,
  banners: ['banners'] as const,
  plans: ['plans'] as const,
}

// ---------- Auth token helper ----------
function getAuthHeaders() {
  try {
    var token = useAuthStore.getState().accessToken
    if (token) return { Authorization: 'Bearer ' + token }
  } catch {}
  return {}
}

// ---------- useUser ----------
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async function() {
      var headers = getAuthHeaders()
      if (!headers.Authorization) return null
      return await api.get<any>('/auth/me', { headers })
    },
    staleTime: 15000,
    retry: 1,
  })
}

// ---------- useMatches ----------
export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: async function() {
      var data = await api.get<any>('/public/matches')
      return (data?.matches || []) as any[]
    },
    staleTime: 30000,
  })
}

// ---------- useOpportunities ----------
export function useOpportunities() {
  return useQuery({
    queryKey: queryKeys.opportunities,
    queryFn: async function() {
      var data = await api.get<any>('/opportunities')
      return (data?.opportunities || []) as any[]
    },
    staleTime: 15000,
  })
}

// ---------- useNotifications ----------
export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.notifications, limit],
    queryFn: async function() {
      var headers = getAuthHeaders()
      if (!headers.Authorization) return { notifications: [], unread: 0 }
      var data = await api.get<any>('/notifications?limit=' + limit, { headers })
      return { notifications: data?.notifications || [], unread: data?.unread || 0 }
    },
    staleTime: 10000,
    retry: 1,
  })
}

// ---------- useBanners ----------
export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: async function() {
      var data = await api.get<any>('/public/banners')
      return (data?.banners || []) as any[]
    },
    staleTime: 60000,
  })
}

// ---------- usePlans ----------
export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: async function() {
      var data = await api.get<any>('/public/plans')
      return (data?.plans || []) as any[]
    },
    staleTime: 60000,
  })
}

// ---------- Refetch helpers ----------
export function useRefetchUser() {
  var qc = useQueryClient()
  return function() { qc.invalidateQueries({ queryKey: queryKeys.user }) }
}

export function useRefetchMatches() {
  var qc = useQueryClient()
  return function() { qc.invalidateQueries({ queryKey: queryKeys.matches }) }
}
