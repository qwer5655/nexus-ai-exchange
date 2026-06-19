// @/lib/supabase — safe anon client for frontend
// For server-side admin client, use @/lib/supabase/server
import { supabase } from './supabase/client'
export { supabase }

// Note: supabaseAdmin has been moved to @/lib/supabase/server
// Do NOT import supabaseAdmin from this file — it should never reach the browser
