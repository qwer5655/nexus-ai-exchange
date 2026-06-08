'use client'
import { create } from 'zustand'
import type { AuthUser, NotificationItem, SavedOpportunity, ReferralStats, UserLevel } from '@/types'

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try { var d = localStorage.getItem('nexus_auth_user'); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveUser(user) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem('nexus_auth_user', JSON.stringify(user));
  else localStorage.removeItem('nexus_auth_user');
}
function randomAvatar() { return 'https://ui-avatars.com/api/?name=' + encodeURIComponent('User' + Date.now().toString().slice(-4)) + '&background=' + ['00ff88','00d9ff','ffd700','ff6b6b','a855f7','f97316','06b6d4','ec4899'][Math.floor(Math.random()*8)] + '&color=fff&size=128'; }

interface AuthState {
  user: AuthUser | null; isAuthModalOpen: boolean;
  authModalType: 'login'|'register'|'forgot'|null;
  notifications: NotificationItem[]; favorites: SavedOpportunity[];
  showWelcomeBonus: boolean; showGuidedTour: boolean; authLoading: boolean;
  init: () => void;
  openAuthModal: (type: 'login'|'register'|'forgot') => void;
  closeAuthModal: () => void;
  register: (data: { username: string; email: string; password: string; country: string; referralCode: string }) => AuthUser;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  addNotification: (item: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleFavorite: (oppId: string) => void;
  isFavorited: (oppId: string) => boolean;
  setShowWelcomeBonus: (val: boolean) => void;
  getReferralStats: () => ReferralStats;
}

export var useAuthStore = create<AuthState>()(function(set, get) { return {
  user: null, isAuthModalOpen: false, authModalType: null,
  notifications: [], favorites: [], showWelcomeBonus: false, showGuidedTour: false, authLoading: false,

  init: function() {
    var u = getStoredUser(); if (u) set({ user: u });
    try { var n = JSON.parse(localStorage.getItem('nexus_notifications') || '[]'); set({ notifications: n }); } catch {}
    try { var f = JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); set({ favorites: f }); } catch {}
    if (u && !localStorage.getItem('nexus_tour_completed')) set({ showGuidedTour: true });
  },

  openAuthModal: function(type) { set({ isAuthModalOpen: true, authModalType: type }); },
  closeAuthModal: function() { set({ isAuthModalOpen: false, authModalType: null }); },

  register: function(data) {
    var newUser = {
      userId: 'U' + Date.now().toString(36).toUpperCase(),
      username: data.username, email: data.email, country: data.country,
      avatar: randomAvatar(), level: 1 as UserLevel,
      registerDate: new Date().toISOString().split('T')[0],
      balance: 5, totalDeposits: 0, totalProfit: 0, tradeCount: 0, winRate: 0,
      referralCode: 'NEXUS' + data.username.toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase(),
      isLoggedIn: true
    };
    saveUser(newUser);
    set({ user: newUser, showWelcomeBonus: true, showGuidedTour: true, isAuthModalOpen: false, authModalType: null });
    var notif = { id: Date.now().toString(), title: 'Welcome to NEXUS', description: 'Account created!', time: 'Just now', read: false, icon: '🎉' };
    var notifs = [notif, ...get().notifications];
    localStorage.setItem('nexus_notifications', JSON.stringify(notifs));
    set({ notifications: notifs });
    return newUser;
  },

  login: function(email, password) {
    var stored = getStoredUser();
    if (stored && stored.email === email) {
      saveUser({ ...stored, isLoggedIn: true });
      set({ user: { ...stored, isLoggedIn: true }, isAuthModalOpen: false, authModalType: null });
      return true;
    }
    var newUser = { userId: 'U' + Date.now().toString(36).toUpperCase(), username: email.split('@')[0], email: email, country: 'USA', avatar: randomAvatar(), level: 1 as UserLevel, registerDate: new Date().toISOString().split('T')[0], balance: 25, totalDeposits: 1, totalProfit: 3.42, tradeCount: 7, winRate: 71.4, referralCode: 'NEXUS' + email.split('@')[0].toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase(), isLoggedIn: true };
    saveUser(newUser);
    set({ user: newUser, isAuthModalOpen: false, authModalType: null });
    return true;
  },

  logout: function() {
    if (get().user) saveUser({ ...get().user, isLoggedIn: false });
    set({ user: null });
  },

  setUser: function(user) { saveUser(user); set({ user }); },
  addNotification: function(item) { var notifs = [item, ...get().notifications].slice(0,50); localStorage.setItem('nexus_notifications', JSON.stringify(notifs)); set({ notifications: notifs }); },
  markNotificationRead: function(id) { var notifs = get().notifications.map(function(n) { return n.id === id ? { ...n, read: true } : n; }); localStorage.setItem('nexus_notifications', JSON.stringify(notifs)); set({ notifications: notifs }); },
  clearNotifications: function() { localStorage.setItem('nexus_notifications', '[]'); set({ notifications: [] }); },
  toggleFavorite: function(oppId) { var f = get().favorites; var e = f.find(function(x) { return x.opportunityId === oppId }); var u = e ? f.map(function(x) { return x.opportunityId === oppId ? { ...x, isFavorite: !x.isFavorite } : x }) : [{ opportunityId: oppId, savedAt: new Date().toISOString(), isFavorite: true, viewedAt: new Date().toISOString() }, ...f]; localStorage.setItem('nexus_favorites', JSON.stringify(u)); set({ favorites: u }); },
  isFavorited: function(oppId) { var f = get().favorites.find(function(x) { return x.opportunityId === oppId }); return f ? f.isFavorite : false; },
  setShowWelcomeBonus: function(val) { set({ showWelcomeBonus: val }); },
  getReferralStats: function() { var u = get().user; return { totalReferrals: 3, activeReferrals: 2, totalCommission: 47.85, todayCommission: 3.20, referralCode: u?.referralCode || 'NEXUSDEFAULT', referralLink: 'https://arbitrage.ai/ref/' + (u?.referralCode || 'NEXUSDEFAULT'), rank: 1284 }; },
};});
