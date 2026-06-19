import { api } from '@/lib/api-client'

export function getNews() { return api.get<any[]>("public/news") }
export function getPlayers() { return api.get<any[]>("public/players") }
export function getBanners() { return api.get<any[]>("public/banners") }
export function getLeaderboard() { return api.get<any[]>("public/leaderboard") }
export function getFeed() { return api.get<any>("public/winning-feed") }
export function getSiteSettings() { return api.get<any>("public/site-settings") }
export function getDepositPlans() { return api.get<any[]>("public/deposit-plans") }
export function getPlans() { return api.get<any[]>("public/plans") }
