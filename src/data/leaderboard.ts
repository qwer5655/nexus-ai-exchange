import type { LeaderboardUser } from '@/types'

export const leaderboardUsers: LeaderboardUser[] = Array.from({ length: 100 }, (_, i) => ({
  id: `U${String(i + 1).padStart(3, '0')}`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=user${i + 1}`,
  name: `User${String(i + 1).padStart(3, '0')}`,
  country: ['🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇩🇪','🇫🇷','🇧🇷','🇯🇵','🇸🇬','🇦🇪','🇨🇭','🇳🇱'][i % 12],
  totalProfit: Math.floor(Math.random() * 50000) + 1000,
  todayProfit: Math.floor(Math.random() * 5000) + 100,
  winRate: Math.floor(Math.random() * 30) + 65,
  rank: i + 1,
}))
