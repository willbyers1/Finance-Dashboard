import React, { useState } from 'react';
import { BudgetPerformance } from '../types';
import { CATEGORIES } from '../lib/categories';
import { Wallet, Plus, AlertCircle, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface BudgetSectionProps {
  budgets: BudgetPerformance[];
  onSaveBudget: (category: string, limit: number) => Promise<void>;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({ budgets, onSaveBudget }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('400');
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveBudget(selectedCategory, parseFloat(limit));
      setShowModal(false);
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="budget-section-card" className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Monthly Category Budgets</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Track actual spending against monthly budget limits</p>
        </div>
        <button
          id="btn-open-budget-modal"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set Budget</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
          No budgets set for this month yet. Click "Set Budget" to start planning!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isOver = b.isOverBudget;
            const isNear = b.percentageUsed >= 85 && !isOver;

            return (
              <div
                key={b.category}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span>{b.category}</span>
                    {isOver && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Over Budget
                      </span>
                    )}
                    {isNear && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Near Limit
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    <span className="font-bold text-slate-900">{formatCurrency(b.actualSpending)}</span> / {formatCurrency(b.monthlyLimit)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{b.percentageUsed}% used</span>
                  <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                    {isOver ? `Exceeded by $${Math.abs(b.remaining).toFixed(0)}` : `$${b.remaining.toFixed(0)} remaining`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900">
            <h4 className="font-bold text-slate-900 text-base">Set Category Monthly Limit</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  required
                  min={10}
                  step={10}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
