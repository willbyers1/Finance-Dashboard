import { AnalyticsSummary, CategorySpend, MonthlyTrend, BudgetPerformance } from '../types';
import { getUserAccounts, getUserTransactions, getUserBudgets } from './db';
import { CATEGORY_COLORS } from './categories';

export function calculateAnalytics(userId: string, targetMonth?: string): AnalyticsSummary {
  // Determine target month YYYY-MM
  const now = new Date();
  const currentMonthKey = targetMonth || now.toISOString().slice(0, 7); // e.g. "2026-08"

  // Calculate previous month key YYYY-MM
  const [year, month] = currentMonthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);

  // 1. Fetch Accounts for Total Balance
  const accounts = getUserAccounts(userId);
  const totalBalance = accounts.reduce((sum, acc) => {
    // Depository & Investment add to asset balance; Credit & Loans subtract debt
    if (acc.type === 'credit' || acc.type === 'loan') {
      return sum - acc.currentBalance;
    }
    return sum + acc.currentBalance;
  }, 0);

  // 2. Fetch all transactions for the user
  const { transactions: allTxs } = getUserTransactions(userId);

  // Filter transactions for target month
  const currentMonthTxs = allTxs.filter(t => t.date.startsWith(currentMonthKey));
  const prevMonthTxs = allTxs.filter(t => t.date.startsWith(prevMonthKey));

  // Calculate Monthly Income & Spending (excluding Transfers!)
  let monthlyIncome = 0;
  let monthlySpending = 0;

  currentMonthTxs.forEach(t => {
    const effectiveCategory = t.categoryOverride || t.category;
    if (effectiveCategory === 'Transfers') return; // Exclude transfers from cash flow

    if (effectiveCategory === 'Income' || t.type === 'income' || t.amount < 0) {
      monthlyIncome += Math.abs(t.amount);
    } else if (t.type === 'expense' || t.amount > 0) {
      monthlySpending += Math.abs(t.amount);
    }
  });

  const netCashFlow = monthlyIncome - monthlySpending;

  // Calculate Previous Month Spending
  let previousMonthSpending = 0;
  prevMonthTxs.forEach(t => {
    const effectiveCategory = t.categoryOverride || t.category;
    if (effectiveCategory === 'Transfers' || effectiveCategory === 'Income' || t.type === 'income' || t.amount < 0) return;
    previousMonthSpending += Math.abs(t.amount);
  });

  // Percentage change in spending
  let spendingChangePercentage = 0;
  if (previousMonthSpending > 0) {
    spendingChangePercentage = Math.round(((monthlySpending - previousMonthSpending) / previousMonthSpending) * 100);
  }

  // 3. Category Breakdown for Target Month
  const categoryMap: Record<string, { amount: number; count: number }> = {};

  currentMonthTxs.forEach(t => {
    const effectiveCategory = t.categoryOverride || t.category;
    if (effectiveCategory === 'Transfers' || effectiveCategory === 'Income' || t.type === 'income' || t.amount < 0) return;

    const amt = Math.abs(t.amount);
    if (!categoryMap[effectiveCategory]) {
      categoryMap[effectiveCategory] = { amount: 0, count: 0 };
    }
    categoryMap[effectiveCategory].amount += amt;
    categoryMap[effectiveCategory].count += 1;
  });

  const categoryBreakdown: CategorySpend[] = Object.entries(categoryMap)
    .map(([category, data]) => {
      const percentage = monthlySpending > 0 ? Math.round((data.amount / monthlySpending) * 100) : 0;
      return {
        category,
        amount: Math.round(data.amount * 100) / 100,
        percentage,
        count: data.count,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const topSpendingCategory = categoryBreakdown[0]?.category || 'N/A';

  // Average transaction amount
  const spendingTxCount = currentMonthTxs.filter(t => {
    const cat = t.categoryOverride || t.category;
    return cat !== 'Transfers' && cat !== 'Income' && t.amount > 0;
  }).length;

  const averageTransactionAmount = spendingTxCount > 0 ? Math.round((monthlySpending / spendingTxCount) * 100) / 100 : 0;

  // 4. Monthly Trends over the last 6 months
  const monthlyTrends: MonthlyTrend[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const mKey = d.toISOString().slice(0, 7); // "YYYY-MM"
    const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    const monthTxs = allTxs.filter(t => t.date.startsWith(mKey));
    let inc = 0;
    let spend = 0;

    monthTxs.forEach(t => {
      const cat = t.categoryOverride || t.category;
      if (cat === 'Transfers') return;
      if (cat === 'Income' || t.type === 'income' || t.amount < 0) {
        inc += Math.abs(t.amount);
      } else if (t.type === 'expense' || t.amount > 0) {
        spend += Math.abs(t.amount);
      }
    });

    monthlyTrends.push({
      month: monthLabel,
      monthKey: mKey,
      income: Math.round(inc),
      spending: Math.round(spend),
      cashFlow: Math.round(inc - spend),
    });
  }

  // 5. Budget Performance
  const userBudgets = getUserBudgets(userId, currentMonthKey);
  const budgetPerformance: BudgetPerformance[] = userBudgets.map(b => {
    const categorySpendObj = categoryBreakdown.find(c => c.category === b.category);
    const actualSpending = categorySpendObj ? categorySpendObj.amount : 0;
    const remaining = b.monthlyLimit - actualSpending;
    const percentageUsed = b.monthlyLimit > 0 ? Math.min(100, Math.round((actualSpending / b.monthlyLimit) * 100)) : 0;

    return {
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      actualSpending: Math.round(actualSpending * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentageUsed,
      isOverBudget: actualSpending > b.monthlyLimit,
    };
  });

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlySpending: Math.round(monthlySpending * 100) / 100,
    netCashFlow: Math.round(netCashFlow * 100) / 100,
    monthString: currentMonthKey,
    previousMonthSpending: Math.round(previousMonthSpending * 100) / 100,
    spendingChangePercentage,
    topSpendingCategory,
    averageTransactionAmount,
    totalTransactionsCount: currentMonthTxs.length,
    categoryBreakdown,
    monthlyTrends,
    budgetPerformance,
  };
}
