'use client'
import { create } from 'zustand'
import type { Opportunity, Stats, LeaderboardUser, WinningEntry, NewsItem } from '@/types'

interface AppState {
  isConnected: boolean
  currentPage: string
  sidebarOpen: boolean
  showDepositModal: boolean
  showMatchModal: boolean
  selectedOpportunity: Opportunity | null
  notifications: { id: string; type: string; message: string }[]
  language: 'en' | 'zh'
  
  stats: Stats
  opportunities: Opportunity[]
  leaderboard: LeaderboardUser[]
  winningFeed: WinningEntry[]
  news: NewsItem[]
  
  userBalance: number
  userDeposits: number[]
  isAuthenticated: boolean
  
  setPage: (page: string) => void
  toggleSidebar: () => void
  setShowDepositModal: (show: boolean) => void
  setShowMatchModal: (show: boolean, opp?: Opportunity | null) => void
  addNotification: (type: string, message: string) => void
  removeNotification: (id: string) => void
  setStats: (stats: Stats) => void
  setOpportunities: (opps: Opportunity[]) => void
  setLeaderboard: (lb: LeaderboardUser[]) => void
  addWinningEntry: (entry: WinningEntry) => void
  setUserBalance: (balance: number) => void
  addDeposit: (amount: number) => void
  setAuthenticated: (val: boolean) => void
  setLanguage: (lang: 'en' | 'zh') => void
  siteSettings: any
  setSiteSettings: (s: any) => void
  banners: any[]
  setBanners: (b: any[]) => void
  categories: any[]
  setCategories: (c: any[]) => void
  tags: any[]
  setTags: (t: any[]) => void
}

export const useStore = create<AppState>((set) => ({
  isConnected: true,
  currentPage: 'home',
  sidebarOpen: false,
  showDepositModal: false,
  showMatchModal: false,
  selectedOpportunity: null,
  notifications: [],
  language: 'en',
  
  stats: {
    todayOpportunities: 0,
    onlineTraders: 0,
    detectedMarkets: 0,
    theoreticalProfit: 0,
    averageYield: 0,
    countriesConnected: 0,
  },
  
  opportunities: [],
  leaderboard: [],
  winningFeed: [],
  news: [],
  
  userBalance: 0,
  userDeposits: [],
  isAuthenticated: false,
  
  setPage: (page: string) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setShowDepositModal: (show: boolean) => set({ showDepositModal: show }),
  setShowMatchModal: (show: boolean, opp?: Opportunity | null) => set({ showMatchModal: show, selectedOpportunity: opp || null }),
  addNotification: (type: string, message: string) => set((s) => ({
    notifications: [...s.notifications, { id: Date.now().toString(), type, message }],
  })),
  removeNotification: (id: string) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id),
  })),
  setStats: (stats: Stats) => set({ stats }),
  setOpportunities: (opps: Opportunity[]) => set({ opportunities: opps }),
  setLeaderboard: (lb: LeaderboardUser[]) => set({ leaderboard: lb }),
  addWinningEntry: (entry: WinningEntry) => set((s) => ({
    winningFeed: [entry, ...s.winningFeed].slice(0, 100),
  })),
  setUserBalance: (balance: number) => set({ userBalance: balance }),
  addDeposit: (amount: number) => set((s) => ({
    userBalance: s.userBalance + amount,
    userDeposits: [...s.userDeposits, amount],
    isAuthenticated: true,
  })),
  setAuthenticated: (val: boolean) => set({ isAuthenticated: val }),
  setLanguage: (lang: 'en' | 'zh') => set({ language: lang }),
  siteSettings: null as any,
  setSiteSettings: (s: any) => set({ siteSettings: s }),
  banners: [] as any[],
  setBanners: (b: any[]) => set({ banners: b }),
  categories: [] as any[],
  setCategories: (c: any[]) => set({ categories: c }),
  tags: [] as any[],
  setTags: (t: any[]) => set({ tags: t }),
  fetchStats: async function() {
    try {
      var r = await fetch('/api/health');
      var d = await r.json();
      if (d && d.stats) set({ stats: d.stats });
    } catch(e) {}
  },
}))

