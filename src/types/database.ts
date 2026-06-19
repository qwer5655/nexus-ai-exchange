export type VipLevel = 0 | 1 | 2 | 3 | 4 | 5
export type DepositStatus = 'pending' | 'approved' | 'rejected'
export type OpportunityStatus = 'draft' | 'published' | 'hidden'
export type UserRole = 'user' | 'admin' | 'super_admin'

export interface DBProfile {
  id: string; email: string; username: string; avatar_url: string | null; country: string;
  vip_level: VipLevel; balance: number; total_profit: number; total_deposit: number;
  total_unlocks: number; referral_code: string; referred_by: string | null;
  role: UserRole; created_at: string; updated_at: string;
}

export interface DBOpportunity {
  id: string; title: string; match_name: string; league: string;
  roi: number; confidence: number; risk_level: string; required_capital: number;
  description: string; ai_report: string | null; status: OpportunityStatus;
  is_locked: boolean; home_team: string; away_team: string;
  bookmaker_a: string; odds_a: number; bookmaker_b: string; odds_b: number;
  profit: number; volume: number; expires_at: string | null;
  created_at: string; updated_at: string;
}

export interface DBUnlock {
  id: string; user_id: string; opportunity_id: string;
  unlock_price: number; created_at: string;
}

export interface DBDeposit {
  id: string; user_id: string; coin: string; amount: number;
  wallet_address: string; tx_hash: string; status: DepositStatus;
  created_at: string; approved_at: string | null;
}

export interface DBReferral {
  id: string; referrer_id: string; referred_user_id: string;
  commission: number; created_at: string;
}

export interface DBNotification {
  id: string; user_id: string; title: string; message: string;
  is_read: boolean; created_at: string;
}

export interface DBActivityFeed {
  id: string; type: string; message: string; created_at: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'commission' | 'bonus' | 'adjustment' | 'topup' | 'unlock'



export interface DBBalanceTransaction {

  id: string; user_id: string; type: TransactionType;

  amount: number; balance_before: number; balance_after: number;

  reference_type: string | null; reference_id: string | null;

  description: string | null;

  created_at: string;

}
