import type { Achievement } from '@/types'

export const achievements: Achievement[] = [
  { id:"A1", name:"First Deposit", description:"Make your first deposit to unlock the platform", icon:"💰", unlocked: false },
  { id:"A2", name:"First Profit", description:"Earn your first arbitrage profit", icon:"📈", unlocked: false },
  { id:"A3", name:"Top Trader", description:"Reach the top 10 on the leaderboard", icon:"🏆", unlocked: false },
  { id:"A4", name:"VIP Trader", description:"Deposit over $1,000 total", icon:"💎", unlocked: false },
  { id:"A5", name:"Legend Trader", description:"Earn over $10,000 in total profit", icon:"👑", unlocked: false },
  { id:"A6", name:"Speed Demon", description:"Execute an arbitrage within 30 seconds of detection", icon:"⚡", unlocked: false },
  { id:"A7", name:"Global Trader", description:"Trade on matches from 10 different countries", icon:"🌍", unlocked: false },
  { id:"A8", name:"Night Owl", description:"Complete a trade after midnight", icon:"🦉", unlocked: false },
]
