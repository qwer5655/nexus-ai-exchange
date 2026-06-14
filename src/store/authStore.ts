'use client'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
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
  showWelcomeBonus: boolean; showGuidedTour: boolean; authLoading: boolean; accessToken: string | null;
  init: () => void;
  openAuthModal: (type: 'login'|'register'|'forgot') => void;
  closeAuthModal: () => void;
  register: (data: { username: string; email: string; password: string; country: string; referralCode: string }) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  addNotification: (item: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleFavorite: (oppId: string) => void;
  isFavorited: (oppId: string) => boolean;
  setShowWelcomeBonus: (val: boolean) => void;
  getReferralStats: () => Promise<ReferralStats> | ReferralStats;
}

export var useAuthStore = create<AuthState>()(function(set, get) { return {
  user: null, isAuthModalOpen: false, authModalType: null,
  notifications: [], favorites: [], showWelcomeBonus: false, showGuidedTour: false, authLoading: false, accessToken: null,

  init: function() {
    var u = getStoredUser(); if (u && u.isLoggedIn) set({ user: u }); else if (u && !u.isLoggedIn) saveUser(null);
    try { var n = JSON.parse(localStorage.getItem('nexus_notifications') || '[]'); set({ notifications: n }); } catch {}
    try { var f = JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); set({ favorites: f }); } catch {}
    if (u && !localStorage.getItem('nexus_tour_completed')) set({ showGuidedTour: true });
  },

  openAuthModal: function(type) { set({ isAuthModalOpen: true, authModalType: type }); },
  closeAuthModal: function() { set({ isAuthModalOpen: false, authModalType: null }); },

  register: function(data) {
    return fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(async function(resp) {
      var result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Registration failed');
      var loginResp = await fetch('/api/auth/rpc-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      var loginData = await loginResp.json();
      if (!loginResp.ok || !loginData.user) throw new Error('Registration succeeded but login failed.');
      set({ accessToken: loginData.access_token });
      var userData = loginData.user;
      var authUser = {
        userId: userData.id,
        username: data.username,
        email: data.email,
        country: data.country,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.username) + '&background=00ff88&color=fff&size=128',
        level: 1 as UserLevel,
        registerDate: new Date().toISOString().split('T')[0],
        balance: 5,
        totalDeposits: 0,
        totalProfit: 0,
        tradeCount: 0,
        winRate: 0,
        referralCode: result.referral_code || 'NX' + data.username.toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase(),
        isLoggedIn: true,
        role: userData.role || 'user'
      };
      saveUser(authUser);
      set({ user: authUser, showWelcomeBonus: true, showGuidedTour: true, isAuthModalOpen: false, authModalType: null });
      var notif = { id: Date.now().toString(), title: 'Welcome to NEXUS', description: 'Account created!', time: 'Just now', read: false, icon: '🎉' };
      var notifs = [notif, ...get().notifications];
      localStorage.setItem('nexus_notifications', JSON.stringify(notifs));
      set({ notifications: notifs });
      return authUser;
    });
  },

  login: async function(email, password) {
    var resp = await fetch('/api/auth/rpc-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    var data = await resp.json();
    if (!resp.ok || !data.user) throw new Error(data.error || 'Invalid credentials');
    // Create real Supabase Auth session so admin API calls work
    try { await supabase.auth.signInWithPassword({ email, password }) } catch(e: any) {}
    set({ accessToken: data.access_token });
    var userData = data.user;
    var colors = ['00ff88','00d9ff','ffd700','ff6b6b','a855f7','f97316','06b6d4','ec4899'];
    var authUser = {
      userId: userData.id,
      username: userData.username || email.split('@')[0],
      email: userData.email || email,
      country: userData.country || 'USA',
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.username || email.split('@')[0]) + '&background=' + colors[Math.floor(Math.random()*colors.length)] + '&color=fff&size=128',
      level: 1 as UserLevel,
      registerDate: new Date().toISOString().split('T')[0],
      balance: userData.balance !== undefined ? userData.balance : 0,
      totalDeposits: userData.total_deposit !== undefined ? userData.total_deposit : 0,
      totalProfit: userData.total_profit !== undefined ? userData.total_profit : 0,
      tradeCount: userData.trade_count !== undefined ? userData.trade_count : 0,
      winRate: userData.win_rate !== undefined ? userData.win_rate : 0,
      referralCode: userData.referral_code || 'NX' + email.split('@')[0].toUpperCase().slice(0,4) + Date.now().toString(36).slice(-4).toUpperCase(),
      isLoggedIn: true,
      role: userData.role || 'user'
    };
    saveUser(authUser);
    set({ user: authUser, isAuthModalOpen: false, authModalType: null });
    return true;
  },

  logout: function() {
    saveUser(null);
    set({ user: null, accessToken: null });
  },

  setUser: function(user) { saveUser(user); set({ user }); },
  addNotification: function(item) { var notifs = [item, ...get().notifications].slice(0,50); localStorage.setItem('nexus_notifications', JSON.stringify(notifs)); set({ notifications: notifs }); try { var u = get().user; if (u) fetch('/api/notifications?userId=' + u.userId).then(function(r){return r.json()}).then(function(d){ if (d.notifications) set({ notifications: d.notifications }) }).catch(function(){}) } catch(e){} },
  markNotificationRead: function(id) { var notifs = get().notifications.map(function(n) { return n.id === id ? { ...n, read: true } : n; }); localStorage.setItem('nexus_notifications', JSON.stringify(notifs)); set({ notifications: notifs }); },
  clearNotifications: function() { localStorage.setItem('nexus_notifications', '[]'); set({ notifications: [] }); },
  toggleFavorite: function(oppId) { var f = get().favorites; var e = f.find(function(x) { return x.opportunityId === oppId }); var u = e ? f.map(function(x) { return x.opportunityId === oppId ? { ...x, isFavorite: !x.isFavorite } : x }) : [{ opportunityId: oppId, savedAt: new Date().toISOString(), isFavorite: true, viewedAt: new Date().toISOString() }, ...f]; localStorage.setItem('nexus_favorites', JSON.stringify(u)); set({ favorites: u }); },
  isFavorited: function(oppId) { var f = get().favorites.find(function(x) { return x.opportunityId === oppId }); return f ? f.isFavorite : false; },
  setShowWelcomeBonus: function(val) { set({ showWelcomeBonus: val }); },
  getReferralStats: async function() { var u = get().user; if (!u) return { totalReferrals: 0, activeReferrals: 0, totalCommission: 0, todayCommission: 0, referralCode: '', referralLink: '', rank: 0 }; try { var r = await fetch('/api/referrals?userId=' + u.userId); var d = await r.json(); return { totalReferrals: d.total_referrals || 0, activeReferrals: d.active_referrals || 0, totalCommission: d.total_commission || 0, todayCommission: 0, referralCode: u.referralCode || 'NEXUSDEFAULT', referralLink: 'https://arbitrage.ai/ref/' + (u.referralCode || 'NEXUSDEFAULT'), rank: 0 } } catch(e) { return { totalReferrals: 0, activeReferrals: 0, totalCommission: 0, todayCommission: 0, referralCode: u?.referralCode || '', referralLink: '', rank: 0 } }; },
};});
