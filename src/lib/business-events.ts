// Business Events — unified event emitter for all admin modules
// Usage: import { emitEvent } from '@/lib/business-events'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function emitEvent(eventType: string, userId: string | null, metadata: any = {}) {
  try {
    await supabaseAdmin.from('system_events').insert({
      event_type: eventType,
      user_id: userId || undefined,
      metadata: metadata
    })
    return true
  } catch { return false }
}
