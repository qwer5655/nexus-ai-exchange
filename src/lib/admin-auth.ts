import { supabaseAdmin } from './supabase'

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  role?: string;
  error?: string;
  status: number;
}

export async function verifyAuth(req: Request): Promise<AuthResult> {
  var authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    var token = authHeader.slice(7)
    try {
      var { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) return { authorized: true, userId: user.id, status: 200 }
    } catch(e: any) {}
  }
  // Fallback: check x-admin-email (used when GoTrue is unavailable)
  var adminEmail = req.headers.get('x-admin-email')
  if (adminEmail) {
    try {
      var { data: profile } = await supabaseAdmin.from('profiles').select('id,role').eq('email', adminEmail).single()
      if (profile) return { authorized: true, userId: profile.id, status: 200 }
    } catch(e: any) {}
  }
  return { authorized: false, error: 'Unauthorized', status: 401 }
}

export async function verifyAdmin(req: Request): Promise<AuthResult> {
  var auth = await verifyAuth(req)
  if (!auth.authorized) return auth
  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('id,role').eq('id', auth.userId).single()
    if (!profile) return { authorized: false, error: 'User not found', status: 404 }
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return { authorized: false, error: 'Forbidden: admin access required', status: 403 }
    }
    return { authorized: true, userId: profile.id, role: profile.role, status: 200 }
  } catch(e: any) {
    return { authorized: false, error: (e as Error).message, status: 500 }
  }
}

export async function verifyUser(req: Request, targetUserId: string): Promise<AuthResult> {
  var auth = await verifyAuth(req)
  if (!auth.authorized) return auth
  // Allow if admin OR if the authenticated user matches the target
  if (auth.userId === targetUserId) return { ...auth, authorized: true }
  // Check if admin
  try {
    var { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', auth.userId).single()
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      return { ...auth, authorized: true, role: profile.role }
    }
  } catch(e: any) {}
  return { authorized: false, error: 'Forbidden: cannot access other users', status: 403 }
}

export async function logAdminAction(adminId: string, action: string, targetType?: string, targetId?: string, details?: any) {
  try {
    await supabaseAdmin.rpc('log_admin_action', {
      p_admin_id: adminId, p_action: action, p_target_type: targetType || null, p_target_id: targetId || null, p_details: details ? JSON.stringify(details) : null
    })
  } catch(e: any) { console.error('Audit log failed:', (e as Error).message) }
}