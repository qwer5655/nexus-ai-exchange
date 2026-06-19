import type { WinningEntry } from '@/types'

export function generateWinningEntry(): WinningEntry {
  const users = ['AlphaTrader','CryptoKing','GoalHunter','ArbiPro','FIFAWhale','SmartBet','OddsMaster','ValueFinder','SureWin','ProfitPilot','AceTrader','LuckyStrike']
  return {
    id: Math.random().toString(36).substring(2, 8),
    user: users[Math.floor(Math.random() * users.length)] + Math.floor(Math.random() * 999),
    amount: Math.floor(Math.random() * 200) + 10,
    time: 'just now',
  }
}

export const initialWinningEntries: WinningEntry[] = [
  { id:"W1", user:"AlphaTrader381", amount:53, time:"just now" },
  { id:"W2", user:"CryptoKing912", amount:84, time:"12s ago" },
  { id:"W3", user:"GoalHunter442", amount:27, time:"25s ago" },
  { id:"W4", user:"ArbiPro220", amount:61, time:"38s ago" },
  { id:"W5", user:"FIFAWhale156", amount:112, time:"45s ago" },
  { id:"W6", user:"SmartBet788", amount:43, time:"52s ago" },
  { id:"W7", user:"OddsMaster501", amount:95, time:"1m ago" },
  { id:"W8", user:"ValueFinder334", amount:38, time:"1m 12s ago" },
  { id:"W9", user:"SureWin677", amount:156, time:"1m 25s ago" },
  { id:"W10", user:"ProfitPilot899", amount:72, time:"1m 38s ago" }
]
