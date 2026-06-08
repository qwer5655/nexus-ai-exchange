export interface Opportunity {
  id: string;
  match: string;
  competition: string;
  yield: number;
  profit: number;
  requiredCapital: number;
  availableVolume: number;
  riskScore: number;
  aiConfidence: number;
  remainingTime: string;
  status: 'HOT' | 'LIMITED' | 'EXPIRING' | 'PREMIUM' | 'EXCLUSIVE';
  homeTeam: string;
  awayTeam: string;
  league: string;
  bookmakerA: { name: string; odds: number; stake: number };
  bookmakerB: { name: string; odds: number; stake: number };
}

export interface Player {
  id: string;
  name: string;
  country: string;
  flag: string;
  goals: number;
  marketPopularity: number;
  aiScore: number;
  position: string;
  image: string;
}

export interface Stats {
  todayOpportunities: number;
  onlineTraders: number;
  detectedMarkets: number;
  theoreticalProfit: number;
  averageYield: number;
  countriesConnected: number;
}

export interface LeaderboardUser {
  id: string;
  avatar: string;
  name: string;
  country: string;
  totalProfit: number;
  todayProfit: number;
  winRate: number;
  rank: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  date: string;
  aiSummary: string;
}

export interface MatchEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  time: string;
  competition: string;
  status: 'live' | 'upcoming' | 'finished';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface DepositPlan {
  id: string;
  amount: number;
  bonus: string;
  popular?: boolean;
}

export interface WinningEntry {
  id: string;
  user: string;
  amount: number;
  time: string;
}


export type UserLevel = 1 | 2 | 3 | 4 | 5;
export const USER_LEVEL_NAMES: Record<number, string> = { 1: 'Explorer', 2: 'Trader', 3: 'Professional', 4: 'Elite', 5: 'Legend' };
export const USER_LEVEL_NAMES_ZH: Record<number, string> = { 1: '探险家', 2: '交易者', 3: '专业型', 4: '精英', 5: '传奇' };

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  country: string;
  avatar: string;
  level: UserLevel;
  registerDate: string;
  balance: number;
  totalDeposits: number;
  totalProfit: number;
  tradeCount: number;
  winRate: number;
  referralCode: string;
  isLoggedIn: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
}

export interface SavedOpportunity {
  opportunityId: string;
  savedAt: string;
  isFavorite: boolean;
  viewedAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  todayCommission: number;
  referralCode: string;
  referralLink: string;
  rank: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  referralCode: string;
}
