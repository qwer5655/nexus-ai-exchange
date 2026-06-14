// P3-3 Plan System — Plan definitions and access control
// Usage: import { getPlan, getFeatureAccess, checkLimit } from '@/lib/plans'

export interface Plan {
  name: string
  monthly_price: number
  credits: number
  features: Record<string, boolean>
  limits: Record<string, number>
}

export var plans: Record<string, Plan> = {
  free: {
    name: 'Free',
    monthly_price: 0,
    credits: 100,
    features: { analytics: false, automation: false, bulk_action: false, api_access: false },
    limits: { api_calls: 100, concurrent_jobs: 1, team_members: 1 }
  },
  pro: {
    name: 'Pro',
    monthly_price: 29,
    credits: 5000,
    features: { analytics: true, automation: true, bulk_action: false, api_access: true },
    limits: { api_calls: 5000, concurrent_jobs: 5, team_members: 5 }
  },
  enterprise: {
    name: 'Enterprise',
    monthly_price: 199,
    credits: 50000,
    features: { analytics: true, automation: true, bulk_action: true, api_access: true },
    limits: { api_calls: 100000, concurrent_jobs: 50, team_members: 100 }
  }
}

export function getPlan(planName: string): Plan | null {
  return plans[planName] || null
}

export function getFeatureAccess(planName: string, feature: string): boolean {
  var plan = plans[planName]
  if (!plan) return false
  return plan.features[feature] === true
}

export function checkLimit(planName: string, limit: string, currentValue: number): boolean {
  var plan = plans[planName]
  if (!plan) return false
  var maxVal = plan.limits[limit]
  if (maxVal === undefined) return false
  return currentValue <= maxVal
}
