import React from 'react';
import { AnalyticsSummary } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl animate-pulse h-28 flex flex-col justify-between shadow-xs">
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-7 bg-slate-100 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const isNetPositive = analytics.netCashFlow >= 0;
  const isSpendingUp = analytics.spendingChangePercentage > 0;

  return (
    <div id="summary-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Balance */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Net Balance</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(analytics.totalBalance)}
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
          <span>Across all connected accounts</span>
        </div>
      </div>

      {/* 2. Monthly Income */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
          {formatCurrency(analytics.monthlyIncome)}
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
          <span className="text-emerald-700 font-semibold">Excludes internal transfers</span>
        </div>
      </div>

      {/* 3. Monthly Spending */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Monthly Spending</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(analytics.monthlySpending)}
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          {analytics.spendingChangePercentage !== 0 ? (
            <span
              className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSpendingUp
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {isSpendingUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(analytics.spendingChangePercentage)}% vs last mo
            </span>
          ) : (
            <span>Same as previous month</span>
          )}
        </div>
      </div>

      {/* 4. Net Cash Flow */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Net Cash Flow</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isNetPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isNetPositive ? '+' : ''}{formatCurrency(analytics.netCashFlow)}
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
          <span>Income minus expenses</span>
        </div>
      </div>
    </div>
  );
};
