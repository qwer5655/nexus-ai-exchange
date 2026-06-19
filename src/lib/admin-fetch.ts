import { supabase } from './supabase'
import { useAuthStore } from '@/store/authStore'

export async function adminFetch(url: string, opts?: RequestInit) {
  var headers: Record<string, string> = { ...opts?.headers as Record<string, string> }

  // Try to get session with 2s timeout (GoTrue may hang on this project)
  try {
    var sessionResult: any = await Promise.race([
      supabase.auth.getSession(),
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 2000))
    ]);
    var session = sessionResult?.data?.session
    if (session?.access_token) {
      headers['Authorization'] = 'Bearer ' + session.access_token
      return fetch(url, { ...opts, headers })
    }
  } catch(e: any) {}

  try {
    var state = useAuthStore.getState() as any
    if (state.accessToken) {
      headers['Authorization'] = 'Bearer ' + state.accessToken
    }
    if (!headers['Authorization'] && state.user?.email && state.user?.role === 'admin') {
      headers['x-admin-email'] = state.user.email
    }
  } catch(e: any) {}

  return fetch(url, { ...opts, headers })
}