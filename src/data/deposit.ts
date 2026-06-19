import type { DepositPlan } from '@/types'

export const depositPlans: DepositPlan[] = [
  { id:"D1", amount:20, bonus:"No bonus", popular: false },
  { id:"D2", amount:50, bonus:"+$5 Bonus", popular: false },
  { id:"D3", amount:100, bonus:"+$15 Bonus", popular: true },
  { id:"D4", amount:200, bonus:"+$35 Bonus", popular: false },
  { id:"D5", amount:500, bonus:"+$100 Bonus", popular: false },
  { id:"D6", amount:1000, bonus:"+$250 Bonus", popular: false },
]

export const paymentMethods = [
  { id:"BTC", name:"Bitcoin", icon:"btc" },
  { id:"ETH", name:"Ethereum", icon:"eth" },
  { id:"USDT_TRC20", name:"Tether", icon:"usdt" },
  { id:"BNB", name:"BNB", icon:"bnb" },
  { id:"SOL", name:"Solana", icon:"sol" },
]
