export type AccountType = 'depository' | 'credit' | 'investment' | 'loan' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  userId: string;
  plaidInstitutionId: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  encryptedAccessToken: string;
  status: 'active' | 'requires_reauth' | 'error';
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccount {
  id: string;
  institutionId: string;
  userId: string;
  plaidAccountId: string;
  name: string;
  officialName?: string;
  type: AccountType;
  subtype?: string;
  mask: string;
  currentBalance: number;
  availableBalance?: number;
  isoCurrencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  plaidTransactionId?: string;
  merchantName: string;
  description: string;
  amount: number; // Positive = Expense, Negative = Income in Plaid convention, normalized internally
  normalizedAmount: number; // Always positive for display
  type: TransactionType;
  currency: string;
  date: string; // YYYY-MM-DD
  pending: boolean;
  category: string; // Internal standard category
  plaidCategory?: string[];
  categoryOverride?: string; // User manual override
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  period: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export interface SyncState {
  id: string;
  institutionId: string;
  userId: string;
  cursor?: string;
  lastSyncedAt: string;
  status: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
}

export interface AnalyticsSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlySpending: number;
  netCashFlow: number;
  monthString: string; // YYYY-MM
  previousMonthSpending: number;
  spendingChangePercentage: number;
  topSpendingCategory: string;
  averageTransactionAmount: number;
  totalTransactionsCount: number;
  categoryBreakdown: CategorySpend[];
  monthlyTrends: MonthlyTrend[];
  budgetPerformance: BudgetPerformance[];
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string; // e.g. "Jan 2026"
  monthKey: string; // "2026-01"
  income: number;
  spending: number;
  cashFlow: number;
}

export interface BudgetPerformance {
  category: string;
  monthlyLimit: number;
  actualSpending: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
